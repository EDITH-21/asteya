import crypto from "crypto";

/**
 * Hash a password using scrypt with a cryptographically secure random salt.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: derivedKey.toString("hex"),
        salt,
      });
    });
  });
}

/**
 * Verify a candidate password against the stored scrypt hash and salt in constant time.
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  return new Promise((resolve) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = derivedKey;
        const hashBuffer = Buffer.from(storedHash, "hex");
        if (keyBuffer.length !== hashBuffer.length) {
          return resolve(false);
        }
        resolve(crypto.timingSafeEqual(keyBuffer, hashBuffer));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generate a cryptographically secure random token (e.g. for session identifiers).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash a session token with SHA-256 before storing it in the database.
 * This prevents token compromise if the database file is read.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
