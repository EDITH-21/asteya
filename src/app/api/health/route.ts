import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Asteya Platform",
    timestamp: new Date().toISOString(),
  });
}
