import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { getServicesList, initializeDatabase } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const services = getServicesList();
    return NextResponse.json({ success: true, services });
  } catch (err) {
    console.error("[API] Error fetching services list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
