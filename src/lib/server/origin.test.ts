import assert from "node:assert";
import { isAllowedOrigin } from "./origin";

async function runTests() {
  console.log("Running isAllowedOrigin unit tests...\n");

  const originalEnv = { ...process.env };

  try {
    // Test 1: Null origin (same-origin / navigation)
    assert.strictEqual(isAllowedOrigin(null, "aadrut.tech"), true, "Null origin should be allowed");

    // Test 2: In Production mode (NODE_ENV = 'production')
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://aadrut.tech";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "aadrut-official.vercel.app";
    process.env.VERCEL_URL = "aadrut-preview-123.vercel.app";

    // Allowed production domains
    assert.strictEqual(isAllowedOrigin("https://aadrut.tech", "aadrut.tech"), true, "Production domain aadrut.tech must be allowed");
    assert.strictEqual(isAllowedOrigin("https://www.aadrut.tech", "www.aadrut.tech"), true, "www.aadrut.tech must be allowed");
    assert.strictEqual(isAllowedOrigin("https://aadrut.com", "aadrut.com"), true, "aadrut.com must be allowed");

    // Project-specific Vercel URLs
    assert.strictEqual(
      isAllowedOrigin("https://aadrut-official.vercel.app", "aadrut-official.vercel.app"),
      true,
      "Exact project VERCEL_PROJECT_PRODUCTION_URL must be allowed"
    );
    assert.strictEqual(
      isAllowedOrigin("https://aadrut-preview-123.vercel.app", "aadrut-preview-123.vercel.app"),
      true,
      "Exact project VERCEL_URL must be allowed"
    );

    // Arbitrary *.vercel.app wildcards must be REJECTED
    assert.strictEqual(
      isAllowedOrigin("https://attacker-project.vercel.app", "aadrut.tech"),
      false,
      "Arbitrary *.vercel.app wildcard must be rejected"
    );
    assert.strictEqual(
      isAllowedOrigin("https://malicious.vercel.app", "aadrut.tech"),
      false,
      "Foreign vercel.app domains must be rejected"
    );

    // asteya.tech must be REJECTED
    assert.strictEqual(
      isAllowedOrigin("https://asteya.tech", "asteya.tech"),
      false,
      "asteya.tech must be rejected"
    );
    assert.strictEqual(
      isAllowedOrigin("https://sub.asteya.tech", "aadrut.tech"),
      false,
      "*.asteya.tech must be rejected"
    );

    // Localhost in PRODUCTION must be REJECTED
    assert.strictEqual(
      isAllowedOrigin("http://localhost:3000", "localhost:3000"),
      false,
      "Localhost must be rejected when NODE_ENV === 'production'"
    );
    assert.strictEqual(
      isAllowedOrigin("http://127.0.0.1:3000", "127.0.0.1:3000"),
      false,
      "127.0.0.1 must be rejected when NODE_ENV === 'production'"
    );

    // Test 3: In Development mode (NODE_ENV = 'development')
    process.env.NODE_ENV = "development";
    assert.strictEqual(
      isAllowedOrigin("http://localhost:3000", "localhost:3000"),
      true,
      "Localhost must be allowed when NODE_ENV === 'development'"
    );
    assert.strictEqual(
      isAllowedOrigin("http://127.0.0.1:3000", "127.0.0.1:3000"),
      true,
      "127.0.0.1 must be allowed when NODE_ENV === 'development'"
    );

    // Test 4: Malformed Origin
    assert.strictEqual(isAllowedOrigin("not-a-valid-url", "aadrut.tech"), false, "Malformed origin must be rejected");

    console.log("✓ All isAllowedOrigin tests passed successfully!");
  } finally {
    process.env = originalEnv;
  }
}

runTests();
