import { ADMIN_BASE_PATH } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getAboutContent,
  updateAboutContent,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { AboutContentSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const about = await getAboutContent();
    return NextResponse.json({ success: true, about });
  } catch (err) {
    console.error("[API] Error fetching about content:", err);
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
    const parsed = AboutContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid about content" },
        { status: 400 }
      );
    }

    const updated = await updateAboutContent(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "UPDATE_ABOUT_CONTENT",
      entityType: "about",
      details: `Updated editorial about content: "${updated.headline}"`,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath(ADMIN_BASE_PATH);

    return NextResponse.json({ success: true, about: updated });
  } catch (err) {
    console.error("[API] Error updating about content:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
