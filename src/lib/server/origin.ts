/**
 * Origin Verification Allowlist
 * Ensures cross-site state-changing requests (POST, PATCH, DELETE) come
 * from verified origins rather than solely relying on the Host header.
 */

export function isAllowedOrigin(originHeader: string | null, hostHeader: string | null): boolean {
  if (!originHeader) {
    // Non-CORS same-origin requests or standard browser navigations may omit Origin
    return true;
  }

  try {
    const originUrl = new URL(originHeader);
    const originHostname = originUrl.hostname.toLowerCase();

    // 1. Check explicitly configured production site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      try {
        const configuredHost = new URL(siteUrl).hostname.toLowerCase();
        if (originHostname === configuredHost) {
          return true;
        }
      } catch {
        // Invalid URL in env, continue to other checks
      }
    }

    // 2. Primary Production domains (Aadrut and Asteya transition)
    if (
      originHostname === "aadrut.tech" ||
      originHostname.endsWith(".aadrut.tech") ||
      originHostname === "aadrut.com" ||
      originHostname.endsWith(".aadrut.com") ||
      originHostname === "asteya.tech" ||
      originHostname.endsWith(".asteya.tech")
    ) {
      return true;
    }

    // 3. Vercel deployment domains (*.vercel.app)
    if (originHostname.endsWith(".vercel.app")) {
      return true;
    }

    // 4. Vercel system environment variables (VERCEL_URL or VERCEL_PROJECT_PRODUCTION_URL)
    const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercelUrl) {
      const cleanVercelHost = vercelUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
      if (originHostname === cleanVercelHost) {
        return true;
      }
    }

    // 5. Localhost and loopback development allowlist
    if (
      originHostname === "localhost" ||
      originHostname === "127.0.0.1" ||
      originHostname === "0.0.0.0" ||
      originHostname.endsWith(".localhost")
    ) {
      return true;
    }

    // 6. If Host header matches our allowed domains and Origin matches Host exactly
    if (hostHeader) {
      const hostClean = hostHeader.split(":")[0].toLowerCase();
      if (
        (hostClean === "aadrut.tech" ||
          hostClean.endsWith(".aadrut.tech") ||
          hostClean === "aadrut.com" ||
          hostClean.endsWith(".aadrut.com") ||
          hostClean === "asteya.tech" ||
          hostClean.endsWith(".asteya.tech") ||
          hostClean.endsWith(".vercel.app") ||
          hostClean === "localhost" ||
          hostClean === "127.0.0.1") &&
        originHostname === hostClean
      ) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}
