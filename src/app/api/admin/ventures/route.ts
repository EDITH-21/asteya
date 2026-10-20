import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getVentures,
  createVenture,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { VentureSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const ventures = await getVentures();
    return NextResponse.json({ success: true, ventures });
  } catch (err) {
    console.error("[API] Error fetching ventures:", err);
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
    const parsed = VentureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid venture data" },
        { status: 400 }
      );
    }

    const venture = await createVenture(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "CREATE_VENTURE",
      entityType: "venture",
      entityId: venture.id,
      details: `Created venture: "${venture.name}" (${venture.status})`,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, venture }, { status: 201 });
  } catch (err) {
    console.error("[API] Error creating venture:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
