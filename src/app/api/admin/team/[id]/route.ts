import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { updateTeamMember, deleteTeamMember, recordActivityLog } from "@/lib/server/db";
import { TeamMemberSchema } from "@/lib/server/validations";

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
    const parsed = TeamMemberSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updated = await updateTeamMember(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "UPDATE_TEAM_MEMBER",
      entityType: "team",
      entityId: id,
      details: `Updated team member: "${updated.name}" (${updated.displayRole}, Published: ${updated.published})`,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, member: updated });
  } catch (err) {
    console.error("[API] Error updating team member:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
    const deleted = await deleteTeamMember(id);
    if (!deleted) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "DELETE_TEAM_MEMBER",
      entityType: "team",
      entityId: id,
      details: `Deleted team member ID: ${id}`,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Error deleting team member:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
