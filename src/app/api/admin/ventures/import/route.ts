import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  importExistingVentures,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("host"))) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const ventures = await importExistingVentures();

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "IMPORT_VENTURES",
      entityType: "venture",
      entityId: "seed-import",
      details: "Imported default ventures (Attenza) into database",
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, ventures }, { status: 200 });
  } catch (err) {
    console.error("[API] Error importing ventures:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
