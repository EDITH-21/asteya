import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { reorderTeamMembers, recordActivityLog } from "@/lib/server/db";
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

    const updated = await reorderTeamMembers(parsed.data.ids);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "REORDER_TEAM",
      entityType: "team",
      details: `Reordered ${parsed.data.ids.length} team members`,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, team: updated });
  } catch (err) {
    console.error("[API] Error reordering team members:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
