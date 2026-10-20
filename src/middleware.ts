import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAllowedOrigin } from "@/lib/server/origin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("aadrut_admin_session") ||
    request.cookies.get("asteya_admin_session");

  // Protect /admin pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
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
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
