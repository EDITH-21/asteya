import fs from "fs";
import path from "path";
import crypto from "crypto";
import readline from "readline";

// Load environment variables from .env.local if present
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const equalIdx = trimmed.indexOf("=");
        if (equalIdx > 0) {
          const key = trimmed.slice(0, equalIdx).trim();
          let val = trimmed.slice(equalIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // Ignore errors reading env file
    }
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const OWASP_SCRYPT_PARAMS = {
  N: 131072, // 2^17
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
};
const OWASP_SCRYPT_PREFIX = "scrypt$131072$8$1$";

/**
 * Prompt user for a text string via readline
 */
function promptText(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompt user for a password with hidden input (no echo to terminal or shell history)
 */
function promptHiddenPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    const isTTY = stdin.isTTY;

    if (isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding("utf-8");

    let password = "";

    const onData = (chunk: string) => {
      for (let i = 0; i < chunk.length; i++) {
        const ch = chunk[i];

        // Enter key (CR or LF)
        if (ch === "\r" || ch === "\n" || ch === "\u0004") {
          if (isTTY) stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password);
          return;
        }

        // Ctrl+C (SIGINT)
        if (ch === "\u0003") {
          if (isTTY) stdin.setRawMode(false);
          process.stdout.write("\n[Operation cancelled]\n");
          process.exit(130);
        }

        // Backspace
        if (ch === "\u0008" || ch === "\u007f") {
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
        } else if (ch >= " " && ch <= "~") {
          password += ch;
        }
      }
    };

    stdin.on("data", onData);
  });
}

/**
 * Hash password with OWASP N=2^17 scrypt
 */
async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, OWASP_SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: `${OWASP_SCRYPT_PREFIX}${derivedKey.toString("hex")}`,
        salt,
      });
    });
  });
}

async function main() {
  console.log("\n=======================================================");
  console.log("  Aadrut Operations Control - Administrator Setup");
  console.log("=======================================================\n");

  // 1. Resolve Admin Email
  let email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  if (!email || !email.includes("@")) {
    email = (await promptText("Enter Admin Email: ")).toLowerCase().trim();
  } else {
    console.log(`Using email from ADMIN_EMAIL: ${email}`);
  }

  if (!email || !email.includes("@")) {
    console.error("\n[Error] A valid email address is required.");
    process.exit(1);
  }

  // 2. Prompt for Password with Hidden Input
  const password = await promptHiddenPassword("Enter Admin Password (min 12 chars): ");

  if (password.length < 12) {
    console.error("\n[Error] Password does not meet security requirements.");
    console.error("Password must be at least 12 characters long.");
    process.exit(1);
  }

  const confirmPassword = await promptHiddenPassword("Confirm Admin Password: ");

  if (password !== confirmPassword) {
    console.error("\n[Error] Passwords do not match. Operation aborted.");
    process.exit(1);
  }

  console.log("\n[1/3] Generating OWASP scrypt hash (N=131072, r=8, p=1, 32-byte salt)...");
  const { hash, salt } = await hashPassword(password);

  const adminUser: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    passwordSalt: string;
    role: "admin";
    createdAt: string;
    updatedAt: string;
    totpEnabled: boolean;
  } = {
    id: crypto.randomUUID(),
    email,
    username: "Aadrut Admin",
    passwordHash: hash,
    passwordSalt: salt,
    role: "admin" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totpEnabled: false,
  };

  // 3. Save to Upstash Redis if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  let redisSaved = false;
  if (redisUrl && redisToken) {
    try {
      console.log("[2/3] Connecting to Upstash Redis shared store...");
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: redisToken });

      // Check existing user to preserve ID if updating
      const existingUser = await redis.get<{ id: string }>(`admin:user:${email}`);
      if (existingUser?.id) {
        adminUser.id = existingUser.id;
      }

      await redis.set(`admin:user:${email}`, adminUser);
      await redis.set(`admin:user_id:${adminUser.id}`, email);

      // Invalidate existing sessions and clear lockouts
      const sessionHashes = await redis.smembers<string[]>(`admin:user_sessions:${adminUser.id}`);
      if (sessionHashes && sessionHashes.length > 0) {
        for (const sHash of sessionHashes) {
          await redis.del(`session:${sHash}`);
        }
      }
      await redis.del(`admin:user_sessions:${adminUser.id}`);

      // Clear lockouts
      const lockoutKeys = await redis.keys(`lockout:*:${email}*`);
      if (lockoutKeys && lockoutKeys.length > 0) {
        for (const lKey of lockoutKeys) {
          await redis.del(lKey);
        }
      }

      redisSaved = true;
      console.log("      + Administrator persisted to Upstash Redis successfully.");
    } catch (err) {
      console.warn("      ! Could not save to Upstash Redis:", (err as Error).message);
    }
  }

  // 4. Save to local fallback store
  console.log("[3/3] Updating local persistent JSON store...");
  const dataDir = path.join(rootDir, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "asteya-db.json");
  let db: {
    version: number;
    users: typeof adminUser[];
    sessions: unknown[];
    enquiries: unknown[];
    services: unknown[];
    failedLogins: { key: string }[];
    telemetry: unknown[];
  } = {
    version: 1,
    users: [],
    sessions: [],
    enquiries: [],
    services: [],
    failedLogins: [],
    telemetry: [],
  };

  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      if (!db.users) db.users = [];
      if (!db.sessions) db.sessions = [];
      if (!db.failedLogins) db.failedLogins = [];
    } catch {
      // Create fresh
    }
  }

  const existingIdx = db.users.findIndex((u) => u.email === email);
  if (existingIdx >= 0) {
    adminUser.id = db.users[existingIdx].id;
    db.users[existingIdx] = adminUser;
  } else {
    db.users.push(adminUser);
  }

  // Clear previous sessions and lockouts for this email
  db.sessions = db.sessions.filter((s: unknown) => (s as { userId: string }).userId !== adminUser.id);
  db.failedLogins = db.failedLogins.filter((f) => !f.key.includes(email));

  const tmpPath = `${dbPath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmpPath, dbPath);
  console.log("      + Local database store updated successfully.");

  console.log("\n=======================================================");
  console.log("  SUCCESS: Administrator Account Configured");
  console.log("=======================================================");
  console.log(`  Admin Email:     ${email}`);
  console.log(`  Hash Standard:   OWASP scrypt (N=131072, r=8, p=1)`);
  console.log(`  Storage Target:  ${redisSaved ? "Upstash Redis + Local" : "Local Store"}`);
  console.log("  Security Note:   Zero secrets or passwords were logged or printed.");
  console.log("=======================================================");
  console.log("  Log in at: http://localhost:3000/admin/login\n");
}

main().catch((err) => {
  console.error("\n[Fatal Error]", err);
  process.exit(1);
});
