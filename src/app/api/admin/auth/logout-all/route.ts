import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { deleteAllUserSessions, recordActivityLog } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await deleteAllUserSessions(auth.user.id);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "LOGOUT_ALL_DEVICES",
      entityType: "security",
      details: "Revoked all active administrative sessions across devices.",
    });

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out from all devices.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("[API] Error in logout-all:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
