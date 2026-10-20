import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getSiteSettings,
  updateSiteSettings,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { SiteSettingsSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("[API] Error fetching site settings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SiteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid site settings" },
        { status: 400 }
      );
    }

    const updated = await updateSiteSettings(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "UPDATE_SITE_SETTINGS",
      entityType: "settings",
      details: `Updated site configuration (Maintenance: ${updated.maintenanceMode}, Testimonials: ${updated.showTestimonials})`,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("[API] Error updating site settings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
