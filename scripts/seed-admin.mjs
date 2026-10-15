import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const dbDir = path.join(rootDir, "data");
const dbPath = path.join(dbDir, "asteya-db.json");

const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@asteya.tech").toLowerCase().trim();
const password = process.argv[3] || process.env.ADMIN_INITIAL_PASSWORD || "Asteya#Secure2026!";

async function hashPassword(pwd) {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: derivedKey.toString("hex"),
        salt,
      });
    });
  });
}

async function run() {
  console.log(`[Asteya Admin Bootstrap] Provisioning administrator for: ${email}`);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  let db = {
    version: 1,
    users: [],
    sessions: [],
    enquiries: [],
    services: [],
    failedLogins: [],
  };

  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch {
      console.warn("Could not parse existing DB, creating fresh store.");
    }
  }

  const { hash, salt } = await hashPassword(password);

  const existingIdx = db.users.findIndex((u) => u.email === email);
  if (existingIdx >= 0) {
    db.users[existingIdx].passwordHash = hash;
    db.users[existingIdx].passwordSalt = salt;
    db.users[existingIdx].updatedAt = new Date().toISOString();
    console.log(`[Asteya Admin Bootstrap] Updated existing admin user password.`);
  } else {
    db.users.push({
      id: crypto.randomUUID(),
      email,
      username: "Asteya Admin",
      passwordHash: hash,
      passwordSalt: salt,
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Asteya Admin Bootstrap] Created new admin user.`);
  }

  // Clear any active sessions and lockout records for this email
  db.sessions = db.sessions.filter((s) => !db.users.find((u) => u.id === s.userId && u.email === email));
  db.failedLogins = db.failedLogins.filter((f) => !f.key.includes(email));

  const tmpPath = `${dbPath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmpPath, dbPath);

  console.log(`[Asteya Admin Bootstrap] SUCCESS! Admin account is ready.`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Login at: http://localhost:3000/admin/login`);
}

run().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});
