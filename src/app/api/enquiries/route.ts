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

async function sendResendNotification(enquiry: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@asteya.tech";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Asteya Inquiries <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipient,
        reply_to: enquiry.email,
        subject: `[Asteya Project Brief] ${enquiry.type} - ${enquiry.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h2 style="color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Asteya Inquiry</h2>
            <p><strong>Name:</strong> ${enquiry.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${enquiry.email}">${enquiry.email}</a></p>
            <p><strong>Engagement Domain:</strong> ${enquiry.type}</p>
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #6366f1;">
              <strong>Project Overview / Message:</strong>
              <p style="white-space: pre-wrap; margin-top: 8px;">${enquiry.message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This notification was dispatched via Asteya contact systems.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[Resend] Email dispatch warning:", errText);
    }
  } catch (resendError) {
    console.error("[Resend] Network error sending notification:", resendError);
  }
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

    // Honeypot check: If the hidden honeypot field is filled by a bot, silently accept without storing
    if (body._hp && typeof body._hp === "string" && body._hp.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Enquiry submitted successfully.",
        },
        { status: 201 }
      );
    }

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

    // Optionally dispatch via Resend if configured
    await sendResendNotification({ name, email, type, message });

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
