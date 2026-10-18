import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("asteya_admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin endpoints (except /api/admin/auth/login)
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth/login") {
    // Defense-in-depth CSRF check: verify Origin matches Host on state-changing requests
    if (["POST", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json(
              { error: "Cross-origin request rejected." },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid origin header." },
            { status: 403 }
          );
        }
      }
    }

    const sessionCookie = request.cookies.get("asteya_admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized access. Administrator session required." },
        { status: 401 }
      );
    }
  }

  // If visiting /admin/login while already holding a session cookie, allow through
  // (the login page will verify session validity and redirect to /admin)

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
