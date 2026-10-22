/**
 * Origin Verification Allowlist
 * Ensures cross-site state-changing requests (POST, PATCH, DELETE) come
 * strictly from verified origins.
 *
 * Rules:
 * 1. Exact production site URL from NEXT_PUBLIC_SITE_URL (or default production domain aadrut.tech / aadrut.com)
 * 2. This project's own Vercel deployment URLs (VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL, VERCEL_BRANCH_URL)
 * 3. Localhost / loopback only when NODE_ENV !== "production"
 * 4. Strictly NO *.vercel.app wildcards, NO asteya.tech
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

    const isProduction = process.env.NODE_ENV === "production";

    // 1. Localhost and loopback development allowlist (ONLY when NODE_ENV !== "production")
    if (!isProduction) {
      if (
        originHostname === "localhost" ||
        originHostname === "127.0.0.1" ||
        originHostname === "0.0.0.0" ||
        originHostname === "::1" ||
        originHostname.endsWith(".localhost")
      ) {
        return true;
      }
    }

    // 2. Exact production site URL from NEXT_PUBLIC_SITE_URL
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (configuredSiteUrl) {
      try {
        const siteUrlObj = new URL(configuredSiteUrl);
        const configuredSiteHost = siteUrlObj.host.toLowerCase();
        const configuredSiteHostname = siteUrlObj.hostname.toLowerCase();
        if (originHost === configuredSiteHost || originHostname === configuredSiteHostname) {
          return true;
        }
      } catch {
        // Invalid URL in env, continue
      }
    }

    // Optional NEXT_PUBLIC_APP_URL exact check
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (configuredAppUrl) {
      try {
        const appUrlObj = new URL(configuredAppUrl);
        const configuredAppHost = appUrlObj.host.toLowerCase();
        const configuredAppHostname = appUrlObj.hostname.toLowerCase();
        if (originHost === configuredAppHost || originHostname === configuredAppHostname) {
          return true;
        }
      } catch {
        // Invalid URL in env, continue
      }
    }

    // Default production domains (Aadrut)
    if (
      originHostname === "aadrut.tech" ||
      originHostname === "www.aadrut.tech" ||
      originHostname === "aadrut.com" ||
      originHostname === "www.aadrut.com"
    ) {
      return true;
    }

    // 3. This project's own Vercel deployment URLs (strictly exact matching, NO wildcards)
    const vercelUrls = [
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
    ];

    for (const vUrl of vercelUrls) {
      if (vUrl) {
        const cleanVercelHost = vUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
        if (originHost === cleanVercelHost || originHostname === cleanVercelHost) {
          return true;
        }
      }
    }

    // 4. Same-origin match with Host header only if Host is already a recognized allowed host
    if (hostHeader) {
      const cleanHost = hostHeader.trim().toLowerCase();
      const cleanHostname = cleanHost.split(":")[0];
      if (originHost === cleanHost || originHostname === cleanHostname) {
        const isRecognizedHost =
          (!isProduction && (cleanHostname === "localhost" || cleanHostname === "127.0.0.1" || cleanHostname === "::1")) ||
          cleanHostname === "aadrut.tech" ||
          cleanHostname === "www.aadrut.tech" ||
          cleanHostname === "aadrut.com" ||
          cleanHostname === "www.aadrut.com" ||
          (Boolean(configuredSiteUrl) && (() => {
            try { return cleanHostname === new URL(configuredSiteUrl!).hostname.toLowerCase(); } catch { return false; }
          })()) ||
          vercelUrls.some((v) => v && cleanHostname === v.replace(/^https?:\/\//, "").split("/")[0].toLowerCase());

        if (isRecognizedHost) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}
