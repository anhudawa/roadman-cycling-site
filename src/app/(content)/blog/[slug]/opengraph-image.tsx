import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const alt = "Roadman Cycling Blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const pillarColors: Record<string, string> = {
  coaching: "#F16363",
  nutrition: "#4CAF50",
  strength: "#FF9800",
  recovery: "#2196F3",
  "le-metier": "#9C27B0",
};

const pillarLabels: Record<string, string> = {
  coaching: "COACHING",
  nutrition: "NUTRITION",
  strength: "STRENGTH",
  recovery: "RECOVERY",
  "le-metier": "LE METIER",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "Roadman Cycling";
  const author = post?.author ?? "Anthony Walsh";
  const pillar = post?.pillar ?? "coaching";
  const accentColor = pillarColors[pillar] || "#F16363";
  const pillarLabel = pillarLabels[pillar] || pillar.toUpperCase();

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
        {/* Top accent bar */}
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

        {/* Background gradient overlay */}
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
          {/* Pillar badge */}
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
                display: "flex",
                alignItems: "center",
                gap: "10px",
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
                  color: accentColor,
                  fontSize: "20px",
                  letterSpacing: "4px",
                  fontWeight: 600,
                }}
              >
                {pillarLabel}
              </span>
            </div>
            <span
              style={{
                color: "#A0A0A5",
                fontSize: "20px",
                letterSpacing: "4px",
              }}
            >
              BLOG
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              color: "#FAFAFA",
              fontSize:
                title.length > 60
                  ? "48px"
                  : title.length > 40
                    ? "58px"
                    : "68px",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              textTransform: "uppercase",
              maxWidth: "1000px",
            }}
          >
            {title}
          </h1>

          {/* Author */}
          <p
            style={{
              color: "#A0A0A5",
              fontSize: "24px",
              lineHeight: 1.4,
              margin: "20px 0 0",
            }}
          >
            By {author}
          </p>
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
    { ...size }
  );
}
