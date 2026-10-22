/**
 * Resolves the canonical site URL from environment variables or standard fallbacks.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (configured production domain)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (e.g., project.vercel.app)
 * 3. VERCEL_URL (e.g., branch-preview.vercel.app)
 * 4. Fallback to https://aadrut.tech
 */
export function getSiteUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (!url) {
    url = "https://aadrut.tech";
  }
  return url.replace(/\/+$/, "");
}
