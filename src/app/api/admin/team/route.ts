import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicSite } from "@/lib/server/revalidate";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import {
  getTeamMembers,
  createTeamMember,
  recordActivityLog,
  initializeDatabase,
} from "@/lib/server/db";
import { TeamMemberSchema } from "@/lib/server/validations";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const team = await getTeamMembers();
    return NextResponse.json({ success: true, team });
  } catch (err) {
    console.error("[API] Error fetching team members:", err);
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
    const parsed = TeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid team member data" },
        { status: 400 }
      );
    }

    const member = await createTeamMember(parsed.data);

    await recordActivityLog({
      adminId: auth.user.id,
      adminEmail: auth.user.email,
      action: "CREATE_TEAM_MEMBER",
      entityType: "team",
      entityId: member.id,
      details: `Added team member: "${member.name}" (${member.displayRole})`,
    });

    revalidatePublicSite("team");

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err) {
    console.error("[API] Error creating team member:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
