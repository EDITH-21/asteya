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
    const originHost = originUrl.host.toLowerCase(); // includes port if non-standard

    // 0. Exact same-origin match (Origin host matches Host header directly)
    if (hostHeader) {
      const cleanHost = hostHeader.trim().toLowerCase();
      if (originHost === cleanHost) {
        return true;
      }
      // Also match hostname if ports differ due to local reverse proxy
      if (originHostname === cleanHost.split(":")[0]) {
        return true;
      }
    }

    // 1. Check explicitly configured production and app URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      try {
        const configuredHost = new URL(siteUrl).hostname.toLowerCase();
        if (originHostname === configuredHost) {
          return true;
        }
      } catch {
        // Invalid URL in env, continue
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      try {
        const configuredAppHost = new URL(appUrl).hostname.toLowerCase();
        if (originHostname === configuredAppHost) {
          return true;
        }
      } catch {
        // Invalid URL in env, continue
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

    // 4. Vercel system environment variables
    const vercelUrls = [
      process.env.VERCEL_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_BRANCH_URL,
    ];
    for (const vUrl of vercelUrls) {
      if (vUrl) {
        const cleanVercelHost = vUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
        if (originHostname === cleanVercelHost) {
          return true;
        }
      }
    }

    // 5. Localhost and loopback development allowlist
    if (
      originHostname === "localhost" ||
      originHostname === "127.0.0.1" ||
      originHostname === "0.0.0.0" ||
      originHostname === "::1" ||
      originHostname.endsWith(".localhost")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
