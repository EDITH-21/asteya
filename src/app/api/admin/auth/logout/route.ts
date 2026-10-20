import { NextRequest, NextResponse } from "next/server";
import {
  invalidateSession,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
} from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }

    const token =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;
    if (token) {
      await invalidateSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    const cookieOpts = {
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    };

    response.cookies.set({ name: SESSION_COOKIE_NAME, ...cookieOpts });
    response.cookies.set({ name: LEGACY_SESSION_COOKIE_NAME, ...cookieOpts });

    return response;
  } catch (err) {
    console.error("[API] Error during logout:", err);
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
