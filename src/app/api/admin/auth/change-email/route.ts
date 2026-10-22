import { NextRequest, NextResponse } from "next/server";
import { ChangeEmailSchema } from "@/lib/server/validations";
import {
  getAuthenticatedAdmin,
  createAdminSession,
  getClientIp,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/auth";
import {
  getAdminById,
  updateAdminEmail,
  checkRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  recordActivityLog,
} from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/crypto";
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
        { error: "Unauthorized access. Administrator session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ChangeEmailSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid email or password format";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { currentPassword, newEmail } = parsed.data;

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

    // Verify current password before permitting email modification
    const isValid = await verifyPassword(
      currentPassword,
      admin.passwordHash,
      admin.passwordSalt
    );

    if (!isValid) {
      await recordFailedLogin(ip, admin.email);
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    await resetLoginAttempts(ip, admin.email);

    if (admin.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    const updated = await updateAdminEmail(admin.id, newEmail);
    if (!updated) {
      return NextResponse.json(
        { error: "Unable to update email. Address may already be in use." },
        { status: 400 }
      );
    }

    // Reissue administrative session cookie for the updated email address
    const { token } = await createAdminSession(admin.id, req);

    await recordActivityLog({
      adminId: admin.id,
      adminEmail: newEmail,
      action: "CHANGE_ADMIN_EMAIL",
      entityType: "user",
      entityId: admin.id,
      details: `Administrator email updated from ${admin.email} to ${newEmail}`,
    });

    const isSecure = process.env.NODE_ENV === "production";
    const res = NextResponse.json({
      success: true,
      email: newEmail,
      message: "Administrator email updated successfully",
    });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return res;
  } catch (err) {
    console.error("[API] Change admin email error:", err);
    return NextResponse.json({ error: "Failed to update admin email" }, { status: 500 });
  }
}
