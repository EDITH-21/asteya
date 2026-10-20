import { NextRequest, NextResponse } from "next/server";
import { AdminLoginSchema } from "@/lib/server/validations";
import {
  initializeDatabase,
  getAdminByEmail,
  checkRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  updateAdminLastLogin,
  updateAdminPassword,
} from "@/lib/server/db";
import { verifyPassword, hashPassword, needsPasswordRehash } from "@/lib/server/crypto";
import {
  createAdminSession,
  getClientIp,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { createMfaPreAuthToken } from "@/lib/server/totp";

export async function POST(req: NextRequest) {
  try {
    // 0. Defense-in-depth CSRF check: verify Origin against strict allowlist
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { error: "Cross-origin login request rejected." },
        { status: 403 }
      );
    }

    await initializeDatabase();

    const body = await req.json();
    const parsed = AdminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const ip = getClientIp(req);

    // 1. Check rate limit & lockout status (distributed via Redis / local fallback)
    const rateCheck = await checkRateLimit(ip, email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Fetch admin user
    const admin = await getAdminByEmail(email);
    if (!admin) {
      // Record failed attempt even if user doesn't exist to prevent timing enumeration
      await recordFailedLogin(ip, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify password hash using constant-time comparison
    const isValid = await verifyPassword(password, admin.passwordHash, admin.passwordSalt);
    if (!isValid) {
      await recordFailedLogin(ip, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Successful credentials verification: reset failed attempts counter
    await resetLoginAttempts(ip, email);

    // 5. OWASP Rehash: Transparently rehash to OWASP minimum (N=2^17) if using legacy parameters
    if (needsPasswordRehash(admin.passwordHash)) {
      const newHashData = await hashPassword(password);
      await updateAdminPassword(admin.id, newHashData.hash, newHashData.salt);
      console.log(`[Security] Upgraded scrypt hash to OWASP N=2^17 for admin: ${admin.id}`);
    }

    // 6. Multi-Factor Authentication Check
    if (admin.totpEnabled) {
      // Generate temporary short-lived (5 min) pre-auth token; do not issue session cookie yet
      const mfaToken = createMfaPreAuthToken(admin.id, admin.email);
      return NextResponse.json({
        success: true,
        requiresMfa: true,
        mfaToken,
        message: "Two-factor authentication required. Please enter your authenticator code or recovery code.",
      });
    }

    // 7. If MFA is not yet enabled, proceed to complete session creation
    await updateAdminLastLogin(admin.id);
    const { token, expiresAt } = await createAdminSession(admin.id, req);

    const response = NextResponse.json({
      success: true,
      requiresMfa: false,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        lastLoginAt: new Date().toISOString(),
        totpEnabled: false,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      expires: new Date(expiresAt),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication" },
      { status: 500 }
    );
  }
}
