import { ImageResponse } from "next/og";

export const alt = "Blood Engine — Decode your bloodwork like a pro cyclist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#210140",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
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

        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(241,99,99,0.18) 0%, transparent 60%), linear-gradient(135deg, #210140 0%, #252526 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#F16363",
            }}
          />
          <span
            style={{
              color: "#F16363",
              fontSize: "22px",
              letterSpacing: "6px",
              fontWeight: 700,
            }}
          >
            BLOOD ENGINE
          </span>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              color: "#FAFAFA",
              fontSize: "104px",
              fontWeight: 800,
              lineHeight: 0.95,
              margin: 0,
              textTransform: "uppercase",
              maxWidth: "1080px",
            }}
          >
            Decode your bloodwork like a pro cyclist
          </h1>
          <p
            style={{
              color: "#A0A0A5",
              fontSize: "28px",
              lineHeight: 1.3,
              margin: "28px 0 0",
              maxWidth: "900px",
            }}
          >
            Cycling-specific interpretation for masters athletes. Athlete-optimal
            ranges. €97 lifetime access.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#FAFAFA",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            ROADMAN
          </span>
          <span style={{ color: "#F16363", fontSize: "20px" }}>
            roadmancycling.com/blood-engine
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
