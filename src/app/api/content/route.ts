import { NextResponse } from "next/server";
import { getPublicSiteContent } from "@/lib/server/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = await getPublicSiteContent();

    return NextResponse.json(
      { success: true, content },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[Public API] Error fetching site content:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
