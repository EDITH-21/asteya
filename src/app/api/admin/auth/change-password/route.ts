import { NextRequest, NextResponse } from "next/server";
import { ChangePasswordSchema } from "@/lib/server/validations";
import {
  getAuthenticatedAdmin,
  createAdminSession,
  getClientIp,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/auth";
import {
  getAdminById,
  updateAdminPassword,
  checkRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/server/db";
import { verifyPassword, hashPassword } from "@/lib/server/crypto";
import { isAllowedOrigin } from "@/lib/server/origin";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid password format";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch full admin user with password hashes
    const admin = await getAdminById(auth.user.id);
    if (!admin) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ip = getClientIp(req);
    const rateCheck = await checkRateLimit(ip, admin.email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Operation locked. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(
      currentPassword,
      admin.passwordHash,
      admin.passwordSalt
    );

    if (!isCurrentValid) {
      await recordFailedLogin(ip, admin.email);
      return NextResponse.json(
        { error: "Current password does not match" },
        { status: 400 }
      );
    }

    // Reset attempts on successful verification
    await resetLoginAttempts(ip, admin.email);

    // Hash new password using OWASP minimum cost (N=2^17)
    const { hash, salt } = await hashPassword(newPassword);
    await updateAdminPassword(admin.id, hash, salt);

    // Issue new session
    const { token, expiresAt } = await createAdminSession(admin.id, req);

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully. Other active sessions have been terminated.",
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
