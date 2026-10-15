import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { updateServiceRecord } from "@/lib/server/db";
import { ServiceUpdateSchema } from "@/lib/server/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = ServiceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid update data";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const updated = updateServiceRecord(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (err) {
    console.error("[API] Error updating service:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
