import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid administrator session required." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: auth.user,
    });
  } catch (err) {
    console.error("[API] Error verifying admin session:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
