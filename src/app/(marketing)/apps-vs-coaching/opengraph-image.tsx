import { ImageResponse } from "next/og";

export const alt = "Apps vs Coaching — Roadman Cycling";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card for /apps-vs-coaching. Matches the visual language
 * of the /plateau and /masters cards — charcoal + deep-purple gradient,
 * coral accents, condensed heading. Rendered by Satori at build time.
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
        {/* Top coral → purple stripe */}
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
        {/* Gradient wash */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, #210140 0%, #252526 50%, #252526 100%)",
            opacity: 0.92,
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
            APPS VS COACHING
          </span>
          <div
            style={{
              fontSize: "78px",
              fontWeight: 800,
              color: "#FAFAFA",
              lineHeight: 1.05,
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            Apps deliver the work.
          </div>
          <div
            style={{
              fontSize: "78px",
              fontWeight: 800,
              color: "#F16363",
              lineHeight: 1.05,
              marginBottom: "28px",
              maxWidth: "1000px",
            }}
          >
            Coaching writes it.
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#A0A0A5",
              lineHeight: 1.4,
              maxWidth: "950px",
            }}
          >
            TrainingPeaks, Zwift, Whoop, Garmin — and the layer above
            them. An honest comparison, USD pricing, no sales spin.
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
    { ...size },
  );
}
