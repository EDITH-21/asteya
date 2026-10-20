import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "Aadrut | Intelligent Digital Products & Future Ventures";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  let emblemBase64 = "";
  try {
    const emblemPath = path.join(process.cwd(), "public", "aadrut-emblem-light.png");
    if (fs.existsSync(emblemPath)) {
      const buffer = fs.readFileSync(emblemPath);
      emblemBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch {
    // Fallback if filesystem read fails
  }

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
        {/* Background glow effects - Dark theme with Indigo & Cyan accents */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "650px",
            height: "400px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
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
          {/* Emblem Icon */}
          {emblemBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={emblemBase64}
              alt="Aadrut Emblem"
              width={100}
              height={100}
              style={{
                marginBottom: "20px",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                backgroundColor: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
                fontWeight: 800,
                color: "#ffffff",
                marginBottom: "20px",
              }}
            >
              A
            </div>
          )}

          {/* Wordmark */}
          <div
            style={{
              fontSize: "60px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#ffffff",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            AADRUT
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#cbd5e1",
              maxWidth: "850px",
              lineHeight: 1.3,
              marginBottom: "16px",
            }}
          >
            Digital Products • Intelligent Solutions • Future Ventures
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 400,
              color: "#94a3b8",
              maxWidth: "700px",
            }}
          >
            Building what&apos;s next with precision engineering and scalable architecture.
          </div>
        </div>

        {/* Bottom Tagline / Pillars */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <span>Idea</span>
          <span>•</span>
          <span>Build</span>
          <span>•</span>
          <span>Evolve</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
