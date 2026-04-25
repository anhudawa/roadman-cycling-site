import { ImageResponse } from "next/og";

export const alt = "The Masters Plateau Diagnostic — Roadman Cycling";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card for /plateau. Matches the visual language of the
 * /you/[slug] cards — charcoal + deep-purple gradient, coral accents,
 * the condensed heading style. Rendered by Satori at build / request
 * time.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          backgroundColor: "#252526",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top coral → purple stripe for brand recognition */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #F16363, #4C1273)",
          }}
        />
        {/* Subtle gradient wash */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, #210140 0%, #252526 50%, #252526 100%)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#F16363",
              fontSize: "20px",
              letterSpacing: "4px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            THE MASTERS PLATEAU DIAGNOSTIC
          </span>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#F5F0EB",
              lineHeight: 1.05,
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            Twelve questions. Four minutes. One specific answer.
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#A0A0A5",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            For cyclists over 35 whose FTP has stalled. Find out which of
            four profiles you fit — and the exact fix.
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "0",
              color: "#F16363",
              fontSize: "18px",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            ROADMAN CYCLING
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
