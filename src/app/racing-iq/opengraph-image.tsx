import { ImageResponse } from "next/og";

export const alt = "Racing IQ — One Race, Seven Decisions | Roadman Cycling";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card for /racing-iq. Same visual language as the
 * /plateau card: charcoal/deep-purple wash, coral accent, condensed
 * headline — plus the stage route profile as the identifying motif.
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
          padding: "70px",
          backgroundColor: "#210140",
          backgroundImage: "linear-gradient(135deg, #210140 0%, #1c0a33 55%, #252526 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
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
        <div
          style={{
            display: "flex",
            color: "#F16363",
            fontSize: "26px",
            letterSpacing: "12px",
            fontWeight: 700,
          }}
        >
          ROADMAN CYCLING PRESENTS
        </div>
        <div
          style={{
            display: "flex",
            color: "#FAFAFA",
            fontSize: "128px",
            fontWeight: 800,
            letterSpacing: "2px",
            marginTop: "10px",
            textTransform: "uppercase",
          }}
        >
          Racing IQ
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(250,250,250,0.78)",
            fontSize: "34px",
            marginTop: "14px",
          }}
        >
          One race. Seven decisions. Five matches in the box.
        </div>
        {/* The stage profile motif */}
        <svg
          width="1060"
          height="120"
          viewBox="0 0 560 70"
          style={{ marginTop: "44px" }}
        >
          <polyline
            points="0,58 60,54 110,56 160,40 205,44 250,22 290,28 330,10 365,18 420,15 470,2 510,16 560,12"
            fill="none"
            stroke="#F16363"
            strokeWidth="2.5"
          />
        </svg>
        <div
          style={{
            display: "flex",
            color: "rgba(250,250,250,0.55)",
            fontSize: "24px",
            marginTop: "26px",
          }}
        >
          Most riders lose the race 40k before the finish. Find out where you lose it.
        </div>
      </div>
    ),
    { ...size }
  );
}
