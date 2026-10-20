import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { updateAdminMfa } from "@/lib/server/db";
import { verifyTotpCode } from "@/lib/server/totp";
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
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json();
    const { secret, code, hashedRecoveryCodes } = body;

    if (!secret || !code || !Array.isArray(hashedRecoveryCodes)) {
      return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    // Verify candidate code
    const isValid = verifyTotpCode(code, secret, 1);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid code. Please ensure your device clock is synchronized and try again." },
        { status: 400 }
      );
    }

    // Persist MFA settings
    await updateAdminMfa(auth.user.id, {
      totpSecret: secret,
      totpEnabled: true,
      recoveryCodes: hashedRecoveryCodes,
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication successfully enabled.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to enable MFA." }, { status: 500 });
  }
}
