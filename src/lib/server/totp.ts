import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encode a binary buffer into an RFC 4648 Base32 string.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode an RFC 4648 Base32 string into a binary Buffer.
 */
export function base32Decode(str: string): Buffer {
  const cleanStr = str.replace(/[\s=-]/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate a new cryptographically secure 20-byte (160-bit) TOTP secret in Base32.
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Generate an otpauth:// URI for authenticator applications (Google Authenticator, 1Password, etc.).
 */
export function generateTotpUri(secret: string, email: string, issuer = "Asteya"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate a TOTP code for a specific time step counter.
 */
function generateCodeForCounter(secretKey: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretKey).update(counterBuffer).digest();
  const offset = hmac[19] & 0x0f;

  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verify a 6-digit TOTP code against a Base32 secret with drift window tolerance.
 */
export function verifyTotpCode(
  candidateCode: string,
  secret: string,
  windowSteps = 1
): boolean {
  if (!candidateCode || candidateCode.trim().length !== 6) {
    return false;
  }

  const cleanCode = candidateCode.trim();
  const secretKey = base32Decode(secret);
  if (secretKey.length === 0) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const expected = generateCodeForCounter(secretKey, currentCounter + offset);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate 8 secure, single-use recovery codes (e.g. "a3f8-9c12").
 */
export function generateRecoveryCodes(count = 8): {
  plaintextCodes: string[];
  hashedCodes: { hash: string; used: boolean }[];
} {
  const plaintextCodes: string[] = [];
  const hashedCodes: { hash: string; used: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex");
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    const hash = crypto.createHash("sha256").update(formatted.toLowerCase().trim()).digest("hex");

    plaintextCodes.push(formatted);
    hashedCodes.push({ hash, used: false });
  }

  return { plaintextCodes, hashedCodes };
}

/**
 * Verify and consume a candidate recovery code.
 */
export function verifyRecoveryCode(
  candidateCode: string,
  recoveryCodes: { hash: string; used: boolean }[] = []
): { valid: boolean; updatedCodes: { hash: string; used: boolean }[] } {
  const normalizedCandidate = candidateCode.replace(/[\s-]/g, "").toLowerCase().trim();
  const formattedCandidate =
    normalizedCandidate.length === 8
      ? `${normalizedCandidate.slice(0, 4)}-${normalizedCandidate.slice(4, 8)}`
      : candidateCode.toLowerCase().trim();

  const candidateHash = crypto
    .createHash("sha256")
    .update(formattedCandidate)
    .digest("hex");

  let found = false;
  const updatedCodes = recoveryCodes.map((item) => {
    if (!found && !item.used && item.hash === candidateHash) {
      found = true;
      return { ...item, used: true };
    }
    return item;
  });

  return { valid: found, updatedCodes };
}

/**
 * Create a signed, short-lived (5 minutes) MFA pre-authentication token.
 */
export function createMfaPreAuthToken(userId: string, email: string): string {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = JSON.stringify({ userId, email, expiresAt });
  const payloadBase64 = Buffer.from(payload).toString("base64url");

  // Sign using a deterministic internal server seed derived from machine/runtime environment
  const seed = process.env.ADMIN_INITIAL_PASSWORD || process.env.RESEND_API_KEY || "asteya_mfa_sign_seed_2026";
  const signature = crypto.createHmac("sha256", seed).update(payloadBase64).digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and extract payload from an MFA pre-auth token.
 */
export function verifyMfaPreAuthToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const seed = process.env.ADMIN_INITIAL_PASSWORD || process.env.RESEND_API_KEY || "asteya_mfa_sign_seed_2026";
    const expectedSig = crypto.createHmac("sha256", seed).update(payloadBase64).digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
