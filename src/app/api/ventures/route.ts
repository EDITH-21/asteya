import { NextResponse } from "next/server";
import { getPublishedVentures, initializeDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await initializeDatabase();
    const ventures = await getPublishedVentures();

    return NextResponse.json(
      { success: true, ventures },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[Public API] Error fetching ventures:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
