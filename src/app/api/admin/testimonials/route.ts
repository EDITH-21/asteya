import { ADMIN_BASE_PATH } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getTestimonials,
  createTestimonial,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { TestimonialSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const testimonials = await getTestimonials();
    return NextResponse.json({ success: true, testimonials });
  } catch (err) {
    console.error("[API] Error fetching testimonials:", err);
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
    const parsed = TestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid testimonial data" },
        { status: 400 }
      );
    }

    const testimonial = await createTestimonial(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "CREATE_TESTIMONIAL",
      entityType: "testimonial",
      entityId: testimonial.id,
      details: `Created testimonial from "${testimonial.name}" (${testimonial.roleOrCompany})`,
    });

    revalidatePath("/");
    revalidatePath(ADMIN_BASE_PATH);

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (err) {
    console.error("[API] Error creating testimonial:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
