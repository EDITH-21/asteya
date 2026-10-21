import fs from "fs";
import path from "path";

// Load environment variables from .env.local / .env if present
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
      // ignore errors reading env file
    }
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

export const ATTENZA_VENTURE = {
  id: "venture-attenza-01",
  name: "Attenza",
  tagline: "Focus better. Learn smarter.",
  description:
    "Attenza is a productivity-focused learning experience designed to help people create a more focused digital environment.",
  status: "Coming soon" as const,
  label: "Aadrut Venture Labs",
  tags: [
    "Cognitive Friction Reduction",
    "Flow State Architecture",
    "Attention Analytics",
  ],
  link: "https://attenza.aadrut.tech",
  featured: true,
  order: 1,
  published: true,
  stats: [],
  createdAt: "2026-10-18T10:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

async function seedVentures() {
  console.log("\n=======================================================");
  console.log("  Aadrut Ventures - Idempotent Database Seed");
  console.log("=======================================================\n");

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  // 1. Upstash Redis
  if (redisUrl && redisToken) {
    try {
      console.log("[1/2] Connecting to Upstash Redis shared store...");
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: redisToken });

      const existing = (await redis.get<typeof ATTENZA_VENTURE[]>("content:ventures")) || [];
      const index = existing.findIndex(
        (v) => v.name.toLowerCase() === "attenza" || v.id === ATTENZA_VENTURE.id
      );

      if (index === -1) {
        existing.push(ATTENZA_VENTURE);
        console.log("      + Attenza inserted into Upstash Redis.");
      } else {
        existing[index] = {
          ...existing[index],
          name: "Attenza",
          tagline: ATTENZA_VENTURE.tagline,
          description: ATTENZA_VENTURE.description,
          status: ATTENZA_VENTURE.status,
          label: ATTENZA_VENTURE.label,
          tags: ATTENZA_VENTURE.tags,
          link: ATTENZA_VENTURE.link,
          featured: true,
          published: true,
          stats: [], // Ensure no unproven stats
          updatedAt: new Date().toISOString(),
        };
        console.log("      ~ Attenza updated in Upstash Redis (unproven stats removed).");
      }

      await redis.set("content:ventures", existing);
      console.log(`      ✓ Redis ventures updated. Total ventures: ${existing.length}`);
    } catch (err) {
      console.warn("      ! Could not seed to Upstash Redis:", (err as Error).message);
    }
  }

  // 2. Local Fallback Database (asteya-db.json)
  console.log("[2/2] Updating local persistent JSON store...");
  const dataDir = path.join(rootDir, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "asteya-db.json");
  let db: {
    ventures?: typeof ATTENZA_VENTURE[];
    [key: string]: unknown;
  } = {};

  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch {
      db = {};
    }
  }

  const venturesList = Array.isArray(db.ventures) ? db.ventures : [];
  const index = venturesList.findIndex(
    (v) => v.name.toLowerCase() === "attenza" || v.id === ATTENZA_VENTURE.id
  );

  if (index === -1) {
    venturesList.push(ATTENZA_VENTURE);
    console.log("      + Attenza inserted into asteya-db.json.");
  } else {
    venturesList[index] = {
      ...venturesList[index],
      name: "Attenza",
      tagline: ATTENZA_VENTURE.tagline,
      description: ATTENZA_VENTURE.description,
      status: ATTENZA_VENTURE.status,
      label: ATTENZA_VENTURE.label,
      tags: ATTENZA_VENTURE.tags,
      link: ATTENZA_VENTURE.link,
      featured: true,
      published: true,
      stats: [], // Ensure no unproven stats
      updatedAt: new Date().toISOString(),
    };
    console.log("      ~ Attenza updated in asteya-db.json (unproven stats removed).");
  }

  db.ventures = venturesList;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
  console.log(`      ✓ asteya-db.json updated. Total ventures: ${venturesList.length}`);

  console.log("\n[OK] Attenza venture seeded successfully (idempotent).\n");
}

seedVentures().catch((err) => {
  console.error("\n[Error] Failed to seed ventures:", err);
  process.exit(1);
});
