import { NextRequest, NextResponse } from "next/server";
import { EnquiryCreateSchema } from "@/lib/server/validations";
import { createEnquiry, initializeDatabase } from "@/lib/server/db";
import { getClientIp } from "@/lib/server/auth";
import { isAllowedOrigin } from "@/lib/server/origin";
import { isRedisConfigured, redisRateLimit } from "@/lib/server/redis";

// Basic rate limiting for public contact endpoint (sliding window)
const submissionTracker = new Map<string, { count: number; expiresAt: number }>();

function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = submissionTracker.get(ip);
  if (!record || record.expiresAt < now) {
    submissionTracker.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 }); // 10 minutes window
    return true;
  }
  // Enforce max 5 submissions per 10-minute window per IP
  if (record.count >= 5) {
    return false;
  }
  record.count += 1;
  return true;
}

/**
 * Escape HTML special characters to prevent HTML/script injection in email clients.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendNotification(enquiry: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const recipient =
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "hello@asteya.tech";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Aadrut Inquiries <onboarding@resend.dev>";

  // Strip CRLF to block header injection in Subject and Reply-To
  const sanitizedName = enquiry.name.replace(/[\r\n]+/g, " ").trim();
  const sanitizedType = enquiry.type.replace(/[\r\n]+/g, " ").trim();
  const sanitizedEmail = enquiry.email.replace(/[\r\n]+/g, "").trim();
  const safeSubject = `[Aadrut Project Brief] ${sanitizedType} - ${sanitizedName}`;

  const safeHtmlName = escapeHtml(sanitizedName);
  const safeHtmlEmail = escapeHtml(sanitizedEmail);
  const safeHtmlType = escapeHtml(sanitizedType);
  const safeHtmlMessage = escapeHtml(enquiry.message);

  const plainTextMessage = [
    "New Aadrut Project Brief",
    "------------------------",
    `Name: ${sanitizedName}`,
    `Email: ${sanitizedEmail}`,
    `Engagement Domain: ${sanitizedType}`,
    "",
    "Project Overview / Message:",
    enquiry.message,
    "",
    "This notification was dispatched via Aadrut contact systems.",
  ].join("\n");

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
        reply_to: sanitizedEmail,
        subject: safeSubject,
        text: plainTextMessage,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #ffffff;">
            <h2 style="color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">New Aadrut Inquiry</h2>
            <p><strong>Name:</strong> ${safeHtmlName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeHtmlEmail}" style="color: #6366f1;">${safeHtmlEmail}</a></p>
            <p><strong>Engagement Domain:</strong> ${safeHtmlType}</p>
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #6366f1;">
              <strong style="color: #0f172a;">Project Overview / Message:</strong>
              <p style="white-space: pre-wrap; margin-top: 8px; color: #334155; line-height: 1.5;">${safeHtmlMessage}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">This notification was dispatched via Aadrut contact systems.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.warn("[Resend] Email dispatch returned non-200 status code:", res.status);
    }
  } catch {
    console.error("[Resend] Network error sending notification");
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Origin against allowlist to prevent Cross-Site Request Forgery (CSRF)
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { error: "Cross-origin submission rejected." },
        { status: 403 }
      );
    }

    await initializeDatabase();

    // 2. Enforce IP-based rate limiting (Redis shared store or local sliding window)
    const ip = getClientIp(req);
    if (isRedisConfigured()) {
      const rateLimitResult = await redisRateLimit(`contact:${ip}`, 5, 600);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: "Too many submissions. Please wait a few minutes before trying again." },
          { status: 429 }
        );
      }
    } else if (!checkSubmissionRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 3. Honeypot check: If the hidden honeypot field is filled by a bot, silently accept without storing
    if (body._hp && typeof body._hp === "string" && body._hp.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Enquiry submitted successfully.",
        },
        { status: 201 }
      );
    }

    // 4. Validate input with Zod
    const result = EnquiryCreateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, type, message } = result.data;
    const enquiry = await createEnquiry({
      name,
      email,
      type,
      message,
      ipAddress: ip,
    });

    // 5. Dispatch sanitized email via Resend
    await sendResendNotification({ name, email, type, message });

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully. Our team will contact you shortly.",
        id: enquiry.id,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error while processing your request" },
      { status: 500 }
    );
  }
}
