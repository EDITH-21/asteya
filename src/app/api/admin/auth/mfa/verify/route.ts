import { NextRequest, NextResponse } from "next/server";
import {
  getAdminById,
  updateAdminMfa,
  updateAdminLastLogin,
  deleteAllUserSessions,
  initializeDatabase,
} from "@/lib/server/db";
import {
  createAdminSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/auth";
import {
  verifyMfaPreAuthToken,
  verifyTotpCode,
  verifyRecoveryCode,
} from "@/lib/server/totp";
import { isAllowedOrigin } from "@/lib/server/origin";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { error: "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    await initializeDatabase();

    const body = await req.json();
    const { mfaToken, code } = body;

    if (!mfaToken || typeof mfaToken !== "string" || !code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing required MFA credentials." },
        { status: 400 }
      );
    }

    // 1. Verify pre-auth token
    const tokenPayload = verifyMfaPreAuthToken(mfaToken);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "MFA session expired or invalid. Please sign in again." },
        { status: 401 }
      );
    }

    // 2. Fetch admin user
    const admin = await getAdminById(tokenPayload.userId);
    if (!admin || !admin.totpEnabled || !admin.totpSecret) {
      return NextResponse.json(
        { error: "MFA configuration not active for this account." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();
    let isTotpValid = false;
    let isRecoveryCodeValid = false;
    let updatedRecoveryCodes = admin.recoveryCodes || [];

    // 3. Try standard 6-digit TOTP
    if (/^\d{6}$/.test(cleanCode)) {
      isTotpValid = verifyTotpCode(cleanCode, admin.totpSecret, 1);
    }

    // 4. Try recovery code if TOTP failed or format indicates recovery code
    if (!isTotpValid && admin.recoveryCodes && admin.recoveryCodes.length > 0) {
      const recoveryCheck = verifyRecoveryCode(cleanCode, admin.recoveryCodes);
      if (recoveryCheck.valid) {
        isRecoveryCodeValid = true;
        updatedRecoveryCodes = recoveryCheck.updatedCodes;
        await updateAdminMfa(admin.id, { recoveryCodes: updatedRecoveryCodes });
      }
    }

    if (!isTotpValid && !isRecoveryCodeValid) {
      return NextResponse.json(
        { error: "Invalid verification code or recovery code. Please try again." },
        { status: 401 }
      );
    }

    // 5. Verification successful: rotate sessions and create active admin session
    await deleteAllUserSessions(admin.id);
    await updateAdminLastLogin(admin.id);
    const { token, expiresAt } = await createAdminSession(admin.id, req);

    const response = NextResponse.json({
      success: true,
      usedRecoveryCode: isRecoveryCodeValid,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        lastLoginAt: new Date().toISOString(),
        totpEnabled: true,
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
      { error: "Internal error during MFA verification." },
      { status: 500 }
    );
  }
}
