import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicSite } from "@/lib/server/revalidate";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { updateFAQ, deleteFAQ, recordActivityLog } from "@/lib/server/db";
import { FAQSchema } from "@/lib/server/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = FAQSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updated = await updateFAQ(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "UPDATE_FAQ",
      entityType: "faq",
      entityId: id,
      details: `Updated FAQ: "${updated.question}" (Published: ${updated.published})`,
    });

    revalidatePublicSite("faqs");

    return NextResponse.json({ success: true, faq: updated });
  } catch (err) {
    console.error("[API] Error updating FAQ:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return PATCH(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteFAQ(id);
    if (!deleted) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "DELETE_FAQ",
      entityType: "faq",
      entityId: id,
      details: `Deleted FAQ ID: ${id}`,
    });

    revalidatePublicSite("faqs");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Error deleting FAQ:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
