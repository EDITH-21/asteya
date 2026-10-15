import { NextRequest, NextResponse } from "next/server";
import { AdminLoginSchema } from "@/lib/server/validations";
import {
  initializeDatabase,
  getAdminByEmail,
  checkRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  updateAdminLastLogin,
} from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/crypto";
import {
  createAdminSession,
  getClientIp,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
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

    // 1. Check rate limit
    const rateCheck = checkRateLimit(ip, email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Fetch admin user
    const admin = getAdminByEmail(email);
    if (!admin) {
      // Record failed attempt even if user doesn't exist to prevent timing enumeration
      recordFailedLogin(ip, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify password hash using constant-time comparison
    const isValid = await verifyPassword(password, admin.passwordHash, admin.passwordSalt);
    if (!isValid) {
      recordFailedLogin(ip, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Successful login: reset failed attempts
    resetLoginAttempts(ip, email);
    updateAdminLastLogin(admin.id);

    // 5. Create new session
    const { token, expiresAt } = await createAdminSession(admin.id, req);

    // 6. Return response with HttpOnly secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        lastLoginAt: new Date().toISOString(),
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
  } catch (err) {
    console.error("[API] Error during admin login:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication" },
      { status: 500 }
    );
  }
}
