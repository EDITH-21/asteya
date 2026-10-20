import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { generateTotpSecret, generateTotpUri, generateRecoveryCodes } from "@/lib/server/totp";
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

    const secret = generateTotpSecret();
    const otpauthUri = generateTotpUri(secret, auth.user.email, "Aadrut");
    const { plaintextCodes, hashedCodes } = generateRecoveryCodes(8);

    return NextResponse.json({
      success: true,
      secret,
      otpauthUri,
      recoveryCodes: plaintextCodes,
      _hashedRecoveryCodes: hashedCodes, // Temporarily returned so client can send back during enable step
      instructions:
        "Scan the QR code or enter the secret in your authenticator app, record your recovery codes in a secure vault, and submit a 6-digit verification code to activate MFA.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to initialize MFA setup." }, { status: 500 });
  }
}
