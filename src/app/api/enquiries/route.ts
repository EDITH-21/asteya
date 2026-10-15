import { NextRequest, NextResponse } from "next/server";
import { EnquiryCreateSchema } from "@/lib/server/validations";
import { createEnquiry, initializeDatabase } from "@/lib/server/db";
import { getClientIp } from "@/lib/server/auth";

// Basic rate limiting for public contact endpoint (in-memory map)
const submissionTracker = new Map<string, { count: number; expiresAt: number }>();

function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = submissionTracker.get(ip);
  if (!record || record.expiresAt < now) {
    submissionTracker.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 }); // 10 minutes window
    return true;
  }
  if (record.count >= 10) {
    return false;
  }
  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    const ip = getClientIp(req);
    if (!checkSubmissionRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = EnquiryCreateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, type, message } = result.data;
    const enquiry = createEnquiry({
      name,
      email,
      type,
      message,
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully. Our team will contact you shortly.",
        id: enquiry.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API] Error processing enquiry submission:", err);
    return NextResponse.json(
      { error: "Internal server error while processing your request" },
      { status: 500 }
    );
  }
}
