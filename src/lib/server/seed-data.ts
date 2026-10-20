import "server-only";
import type { AdminUser } from "./db";

/**
 * Pre-seeded Administrative Users.
 * Password hashes are pre-computed using OWASP recommended scrypt parameters:
 * N=131072 (2^17), r=8, p=1, maxmem=256MB with cryptographically random 32-byte salt.
 * Initial Password for seed accounts: Asteya#Secure2026!
 *
 * Can be overridden at runtime via ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD,
 * or updated interactively via `npm run admin:create` / the Admin Panel Change Password action.
 */
export const SEED_ADMIN_USERS: AdminUser[] = [
  {
    id: "1d0c3ff8-f299-439c-bae3-5c26530a3217",
    email: "admin@asteya.tech",
    username: "Aadrut Admin",
    passwordHash:
      "scrypt$131072$8$1$5512204830357df44de57566d21431e501539236b61b85442e77514da12705aee393daa12136e5460c1923cfabd632bbec903a77afd071b99154f15204c4feef",
    passwordSalt: "00943b14c5d75c6e3ba3f8d237911d4d0a0527a6067f9fbd93e3d3c11a305377",
    role: "admin",
    createdAt: "2026-10-15T17:22:49.915Z",
    updatedAt: "2026-10-20T17:05:19.157Z",
    totpEnabled: false,
  },
  {
    id: "2e1d4ff9-a399-449c-cae4-6c37641b4328",
    email: "admin@aadrut.com",
    username: "Aadrut Admin",
    passwordHash:
      "scrypt$131072$8$1$5512204830357df44de57566d21431e501539236b61b85442e77514da12705aee393daa12136e5460c1923cfabd632bbec903a77afd071b99154f15204c4feef",
    passwordSalt: "00943b14c5d75c6e3ba3f8d237911d4d0a0527a6067f9fbd93e3d3c11a305377",
    role: "admin",
    createdAt: "2026-10-20T17:00:00.000Z",
    updatedAt: "2026-10-20T17:00:00.000Z",
    totpEnabled: false,
  },
];
