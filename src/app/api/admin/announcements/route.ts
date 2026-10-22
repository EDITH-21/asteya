import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicSite } from "@/lib/server/revalidate";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getAnnouncements,
  createAnnouncement,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { AnnouncementSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const announcements = await getAnnouncements();
    return NextResponse.json({ success: true, announcements });
  } catch (err) {
    console.error("[API] Error fetching announcements:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = AnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid announcement data" },
        { status: 400 }
      );
    }

    const announcement = await createAnnouncement(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "CREATE_ANNOUNCEMENT",
      entityType: "announcement",
      entityId: announcement.id,
      details: `Created announcement: "${announcement.title}" (${announcement.displayStyle})`,
    });

    revalidatePublicSite("announcements");

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (err) {
    console.error("[API] Error creating announcement:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
