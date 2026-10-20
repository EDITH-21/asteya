import "server-only";
import crypto from "crypto";

export const OWASP_SCRYPT_PARAMS = {
  N: 131072, // 2^17 (OWASP Recommended Minimum)
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024, // 256MB allocated for scrypt computation
};

export const LEGACY_SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

export const OWASP_SCRYPT_PREFIX = "scrypt$131072$8$1$";

/**
 * Hash a password using scrypt configured to the OWASP recommended cost (N=2^17, r=8, p=1).
 * Produces a salt and a formatted hash prefixed with algorithm cost metadata.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      64,
      OWASP_SCRYPT_PARAMS,
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve({
          hash: `${OWASP_SCRYPT_PREFIX}${derivedKey.toString("hex")}`,
          salt,
        });
      }
    );
  });
}

/**
 * Verify a candidate password against the stored scrypt hash and salt in constant time.
 * Supports both modern OWASP N=2^17 hashes and legacy N=16384 hashes.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const isOwasp = storedHash.startsWith(OWASP_SCRYPT_PREFIX);
  const rawHashHex = isOwasp ? storedHash.substring(OWASP_SCRYPT_PREFIX.length) : storedHash;
  const params = isOwasp ? OWASP_SCRYPT_PARAMS : LEGACY_SCRYPT_PARAMS;

  return new Promise((resolve) => {
    crypto.scrypt(
      password,
      salt,
      64,
      params,
      (err, derivedKey) => {
        if (err) return resolve(false);
        try {
          const keyBuffer = derivedKey;
          const hashBuffer = Buffer.from(rawHashHex, "hex");
          if (keyBuffer.length !== hashBuffer.length) {
            return resolve(false);
          }
          resolve(crypto.timingSafeEqual(keyBuffer, hashBuffer));
        } catch {
          resolve(false);
        }
      }
    );
  });
}

/**
 * Determine whether a stored hash was computed with older scrypt parameters
 * and requires transparent rehashing to OWASP minimum.
 */
export function needsPasswordRehash(storedHash: string): boolean {
  return !storedHash.startsWith(OWASP_SCRYPT_PREFIX);
}

/**
 * Generate a cryptographically secure random token (e.g. for session identifiers).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash a session token before storing it in the database.
 * If SESSION_SECRET is set, HMAC-SHA256 is used with the secret.
 * Otherwise, SHA-256 digest is used.
 * This prevents token compromise even if database records are exposed.
 */
export function hashToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.trim().length > 0) {
    return crypto.createHmac("sha256", secret.trim()).update(token).digest("hex");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
}
