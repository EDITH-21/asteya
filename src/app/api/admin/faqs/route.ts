import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getFAQs,
  createFAQ,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { FAQSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const faqs = await getFAQs();
    return NextResponse.json({ success: true, faqs });
  } catch (err) {
    console.error("[API] Error fetching FAQs:", err);
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
    const parsed = FAQSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid FAQ data" },
        { status: 400 }
      );
    }

    const faq = await createFAQ(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "CREATE_FAQ",
      entityType: "faq",
      entityId: faq.id,
      details: `Created FAQ: "${faq.question}" (${faq.category})`,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch (err) {
    console.error("[API] Error creating FAQ:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
