import { ImageResponse } from "next/og";

export const alt = "Asteya | Web Development, Business Automation & Digital Solutions";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05070b",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "650px",
            height: "400px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "10%",
            width: "400px",
            height: "350px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        {/* Content Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "40px 60px",
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#34d399",
                boxShadow: "0 0 10px #34d399",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#e2e8f0",
                textTransform: "uppercase",
              }}
            >
              Technology &amp; Ventures
            </span>
          </div>

          {/* Wordmark */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              letterSpacing: "0.22em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            ASTEYA
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#cbd5e1",
              maxWidth: "850px",
              lineHeight: 1.25,
              marginBottom: "24px",
            }}
          >
            Web Development, Business Automation &amp; Digital Solutions
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#94a3b8",
              maxWidth: "700px",
            }}
          >
            Building what&apos;s next with precision engineering and intelligent software.
          </div>
        </div>

        {/* Footer domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          <span>asteya.tech</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
