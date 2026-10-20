import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/auth";
import { getEnquiries, initializeDatabase } from "@/lib/server/db";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const enquiries = await getEnquiries();

    const headers = [
      "ID",
      "Name",
      "Email",
      "Service Type",
      "Status",
      "Message",
      "Internal Notes",
      "Created At",
    ];

    const rows = enquiries.map((e) => [
      escapeCsvField(e.id),
      escapeCsvField(e.name),
      escapeCsvField(e.email),
      escapeCsvField(e.type),
      escapeCsvField(e.status),
      escapeCsvField(e.message),
      escapeCsvField(e.notes || ""),
      escapeCsvField(e.createdAt),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `aadrut-enquiries-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[API] Error exporting enquiries to CSV:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
