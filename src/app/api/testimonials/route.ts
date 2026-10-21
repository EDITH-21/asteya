import { NextResponse } from "next/server";
import { getPublishedTestimonials, getSiteSettings, initializeDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await initializeDatabase();
    const [testimonials, settings] = await Promise.all([
      getPublishedTestimonials(),
      getSiteSettings(),
    ]);

    return NextResponse.json(
      {
        success: true,
        testimonials,
        showTestimonials: settings.showTestimonials,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[Public API] Error fetching testimonials:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
