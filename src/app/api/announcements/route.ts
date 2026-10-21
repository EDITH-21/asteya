import { NextResponse } from "next/server";
import { getPublishedAnnouncements, getActiveAnnouncement, initializeDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await initializeDatabase();
    const [announcements, activeAnnouncement] = await Promise.all([
      getPublishedAnnouncements(),
      getActiveAnnouncement(),
    ]);

    return NextResponse.json(
      {
        success: true,
        announcements,
        activeAnnouncement: activeAnnouncement || (announcements.length > 0 ? announcements[0] : null),
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[Public API] Error fetching announcements:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
