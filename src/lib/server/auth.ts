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

export const SESSION_COOKIE_NAME = "asteya_admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

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
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      token = match.substring(SESSION_COOKIE_NAME.length + 1);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Not in Next.js Server Component or Action context
    }
  }

  if (!token || token.length < 32) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = getSessionByTokenHash(tokenHash);
  if (!session) {
    return null;
  }

  const user = getAdminById(session.userId);
  if (!user || user.role !== "admin") {
    deleteSession(tokenHash);
    return null;
  }

  // Strip sensitive hashes before returning
  const safeUser: Omit<AdminUser, "passwordHash" | "passwordSalt"> = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
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
  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const ipAddress = getClientIp(req);
  const userAgent = req?.headers.get("user-agent") || undefined;

  const session = createSession(userId, tokenHash, expiresAt, ipAddress, userAgent);

  return { token, expiresAt, session };
}

/**
 * Destroy the current session token from the database.
 */
export async function invalidateSession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  deleteSession(tokenHash);
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
    expires: new Date(expiresAt),
  };
}
