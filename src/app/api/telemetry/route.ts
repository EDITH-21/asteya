import { NextRequest, NextResponse } from "next/server";
import { recordTelemetry, initializeDatabase } from "@/lib/server/db";

// Simple in-memory rate limiter for telemetry ingestion: max 60 events per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkTelemetryRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (record.count >= 60) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET() {
  return NextResponse.json({
    service: "Aadrut Attenza Telemetry Ingestion Service",
    status: "operational",
    version: "1.0.0",
    documentation: {
      description:
        "Public endpoint for anonymous product usage & install telemetry from Aadrut ventures (such as the Attenza desktop/browser extension).",
      endpoint: "/api/telemetry",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      requiredFields: {
        extension: "string (e.g. 'attenza')",
        version: "string (semver e.g. '1.0.0')",
        eventType: "'install' | 'ping' | 'session_start' | 'feature_use'",
        anonymousId: "string (SHA-256 hashed unique device/client identifier; no PII)",
      },
      optionalFields: {
        metadata: "object with key-value metrics (e.g. { os: 'windows', focusHours: 4 })",
      },
    },
  });
}

export async function POST(req: NextRequest) {
  await initializeDatabase();

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  if (!checkTelemetryRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many telemetry requests. Please throttle telemetry pings to once per minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { extension = "attenza", version = "1.0.0", eventType, anonymousId, metadata } = body;

    const validEventTypes = ["install", "ping", "session_start", "feature_use"];

    if (!eventType || !validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          error: `Invalid eventType. Must be one of: ${validEventTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!anonymousId || typeof anonymousId !== "string" || anonymousId.trim().length < 8) {
      return NextResponse.json(
        {
          error: "anonymousId must be a non-empty string with at least 8 characters (e.g. SHA-256 device hash)",
        },
        { status: 400 }
      );
    }

    const record = recordTelemetry({
      extensionName: String(extension).slice(0, 32),
      version: String(version).slice(0, 16),
      eventType: eventType as "install" | "ping" | "session_start" | "feature_use",
      anonymousId: String(anonymousId).trim().slice(0, 128),
      metadata: typeof metadata === "object" && metadata !== null ? metadata : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        id: record.id,
        recordedAt: record.timestamp,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Telemetry] Ingestion error:", err);
    return NextResponse.json(
      { error: "Malformed JSON payload or server error." },
      { status: 400 }
    );
  }
}
