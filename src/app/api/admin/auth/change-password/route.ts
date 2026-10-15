import { NextRequest, NextResponse } from "next/server";
import { ChangePasswordSchema } from "@/lib/server/validations";
import { getAuthenticatedAdmin, createAdminSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/server/auth";
import { getAdminById, updateAdminPassword } from "@/lib/server/db";
import { verifyPassword, hashPassword } from "@/lib/server/crypto";

export async function POST(req: NextRequest) {
  try {
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
    const admin = getAdminById(auth.user.id);
    if (!admin) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(
      currentPassword,
      admin.passwordHash,
      admin.passwordSalt
    );

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password does not match" },
        { status: 400 }
      );
    }

    // Hash new password
    const { hash, salt } = await hashPassword(newPassword);
    updateAdminPassword(admin.id, hash, salt);

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
  } catch (err) {
    console.error("[API] Error updating admin password:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
