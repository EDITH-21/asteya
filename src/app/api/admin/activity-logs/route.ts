import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { getActivityLogs, initializeDatabase } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "100", 10)));

    const logs = await getActivityLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error("[API] Error fetching activity logs:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
