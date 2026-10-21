import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAllowedOrigin } from "@/lib/server/origin";
import { ADMIN_BASE_PATH } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("aadrut_admin_session") ||
    request.cookies.get("asteya_admin_session");

  // Protect /shikadu admin UI pages (except /shikadu/login)
  if (pathname.startsWith(ADMIN_BASE_PATH) && pathname !== `${ADMIN_BASE_PATH}/login`) {
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      redirectResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      return redirectResponse;
    }
  }

  // Protect /api/admin endpoints (except unauthenticated auth endpoints)
  const isPublicAuthApi =
    pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/mfa/verify";

  if (pathname.startsWith("/api/admin") && !isPublicAuthApi) {
    // Defense-in-depth CSRF check: verify Origin against allowlist on state-changing requests
    if (["POST", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (!isAllowedOrigin(origin, host)) {
        return NextResponse.json(
          { error: "Cross-origin request rejected." },
          { status: 403 }
        );
      }
    }

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized access. Administrator session required." },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // Enforce noindex and no-cache headers on all admin pages and admin APIs
  if (pathname.startsWith(ADMIN_BASE_PATH) || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }

  return response;
}

export const config = {
  matcher: ["/shikadu/:path*", "/api/admin/:path*"],
};
