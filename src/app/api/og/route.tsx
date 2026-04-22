import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Roadman Cycling";
  const subtitle = searchParams.get("subtitle") || "";
  const type = searchParams.get("type") || "default"; // default, blog, podcast, tool
  const guest = searchParams.get("guest") || "";
  const episodeNumber = searchParams.get("episodeNumber") || "";
  const author = searchParams.get("author") || "";

  const pillarColors: Record<string, string> = {
    coaching: "#F16363",
    nutrition: "#4CAF50",
    strength: "#FF9800",
    recovery: "#2196F3",
    community: "#9C27B0",
  };

  const pillar = searchParams.get("pillar") || "";
  const accentColor = pillarColors[pillar] || "#F16363";

  // Build the type label
  const typeLabel =
    type === "podcast"
      ? episodeNumber
        ? `Episode ${episodeNumber}`
        : "Podcast Episode"
      : type === "blog"
        ? "Blog"
        : type === "tool"
          ? "Free Tool"
          : "";

  // Build the meta line (guest for podcast, author for blog)
  const metaLine =
    type === "podcast" && guest
      ? `with ${guest}`
      : type === "blog" && author
        ? `By ${author}`
        : subtitle;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          backgroundColor: "#252526",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: `linear-gradient(90deg, ${accentColor}, #4C1273)`,
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
              "linear-gradient(135deg, #210140 0%, #252526 50%, #252526 100%)",
            opacity: 0.8,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Type badge */}
          {type !== "default" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: accentColor,
                }}
              />
              <span
                style={{
                  color: "#A0A0A5",
                  fontSize: "22px",
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                }}
              >
                {typeLabel}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            style={{
              color: "#FAFAFA",
              fontSize:
                title.length > 60 ? "52px" : title.length > 40 ? "64px" : "72px",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              textTransform: "uppercase",
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>

          {/* Meta line (guest / author / subtitle) */}
          {metaLine && (
            <p
              style={{
                color: "#A0A0A5",
                fontSize: "26px",
                lineHeight: 1.4,
                margin: "20px 0 0",
                maxWidth: "700px",
              }}
            >
              {metaLine}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#FAFAFA",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            ROADMAN
          </span>
          <span
            style={{
              color: accentColor,
              fontSize: "18px",
            }}
          >
            roadmancycling.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
