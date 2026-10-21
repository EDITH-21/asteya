import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { generateSecureToken, hashToken } from "./crypto";
import {
  createSession,
  getSessionByTokenHash,
  deleteSession,
  getAdminById,
  AdminUser,
  AdminSession,
  initializeDatabase,
} from "./db";

export const SESSION_COOKIE_NAME = "aadrut_admin_session";
export const LEGACY_SESSION_COOKIE_NAME = "asteya_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours
export { ADMIN_BASE_PATH } from "@/lib/constants";

function getSessionSigningSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_INITIAL_PASSWORD;
  if (secret && secret.trim().length > 0) return secret.trim();
  return process.env.VERCEL_GIT_COMMIT_SHA || "aadrut_serverless_session_hmac_secret_2026";
}

function signSessionToken(rawId: string, userId: string, expiresAtMs: number): string {
  const payload = `${rawId}.${userId}.${expiresAtMs}`;
  const secret = getSessionSigningSecret();
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifySignedSessionToken(token: string): { rawId: string; userId: string; expiresAtMs: number } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [rawId, userId, expiresAtStr, sig] = parts;
  const expiresAtMs = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAtMs) || expiresAtMs <= Date.now()) return null;

  const payload = `${rawId}.${userId}.${expiresAtStr}`;
  const secret = getSessionSigningSecret();
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    if (crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) {
      return { rawId, userId, expiresAtMs };
    }
  } catch {
    return null;
  }
  return null;
}

export interface AuthContext {
  user: Omit<AdminUser, "passwordHash" | "passwordSalt">;
  session: AdminSession;
}

/**
 * Extract client IP from headers.
 */
export function getClientIp(req?: Request | NextRequest): string {
  if (!req) return "127.0.0.1";
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Validate active administrator session from HTTP cookies.
 * Returns authenticated user context without sensitive password fields, or null.
 */
export async function getAuthenticatedAdmin(
  req?: NextRequest | Request
): Promise<AuthContext | null> {
  await initializeDatabase();

  let token: string | undefined;

  if (req && req.headers.get("cookie")) {
    const rawCookies = req.headers.get("cookie") || "";
    const match = rawCookies
      .split(";")
      .map((c) => c.trim())
      .find(
        (c) =>
          c.startsWith(`${SESSION_COOKIE_NAME}=`) ||
          c.startsWith(`${LEGACY_SESSION_COOKIE_NAME}=`)
      );
    if (match) {
      token = match.split("=")[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token =
        cookieStore.get(SESSION_COOKIE_NAME)?.value ||
        cookieStore.get(LEGACY_SESSION_COOKIE_NAME)?.value;
    } catch {
      // Not in Next.js Server Component or Action context
    }
  }

  if (!token || token.length < 32) {
    return null;
  }

  const tokenHash = hashToken(token);
  let session = await getSessionByTokenHash(tokenHash);

  // Fallback for multi-lambda serverless environments without shared Redis
  if (!session) {
    const verified = verifySignedSessionToken(token);
    if (verified) {
      session = {
        id: verified.rawId,
        sessionTokenHash: tokenHash,
        userId: verified.userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(verified.expiresAtMs).toISOString(),
      };
    }
  }

  if (!session) {
    return null;
  }

  const user = await getAdminById(session.userId);
  if (!user || user.role !== "admin") {
    await deleteSession(tokenHash);
    return null;
  }

  // Strip sensitive hashes before returning
  const safeUser: Omit<AdminUser, "passwordHash" | "passwordSalt" | "totpSecret" | "recoveryCodes"> = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    totpEnabled: user.totpEnabled,
  };

  return {
    user: safeUser,
    session,
  };
}

/**
 * Create a new cryptographically secure admin session and store its token hash.
 */
export async function createAdminSession(
  userId: string,
  req?: Request | NextRequest
): Promise<{ token: string; expiresAt: string; session: AdminSession }> {
  const rawId = generateSecureToken(16);
  const expiresAtMs = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = signSessionToken(rawId, userId, expiresAtMs);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(expiresAtMs).toISOString();

  const ipAddress = getClientIp(req);
  const userAgent = req?.headers.get("user-agent") || undefined;

  const session = await createSession(userId, tokenHash, expiresAt, ipAddress, userAgent);

  return { token, expiresAt, session };
}

/**
 * Destroy the current session token from the database.
 */
export async function invalidateSession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await deleteSession(tokenHash);
}

/**
 * Cookie attributes for the session cookie.
 */
export function getSessionCookieOptions(expiresAt: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: new Date(expiresAt),
  };
}
