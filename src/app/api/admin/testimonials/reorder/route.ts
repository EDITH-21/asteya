import { ADMIN_BASE_PATH } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicSite } from "@/lib/server/revalidate";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { reorderTestimonials, recordActivityLog } from "@/lib/server/db";
import { ReorderSchema } from "@/lib/server/validations";

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
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
    }

    const updated = await reorderTestimonials(parsed.data.ids);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "REORDER_TESTIMONIALS",
      entityType: "testimonial",
      details: `Reordered ${parsed.data.ids.length} testimonials`,
    });

    revalidatePublicSite("testimonials");

    return NextResponse.json({ success: true, testimonials: updated });
  } catch (err) {
    console.error("[API] Error reordering testimonials:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
