import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { getEnquiries } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const enquiries = await getEnquiries({ status, type, search });

    return NextResponse.json({
      success: true,
      enquiries,
      total: enquiries.length,
    });
  } catch (err) {
    console.error("[API] Error fetching enquiries:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
