import { ImageResponse } from "next/og";
import { getTopicBySlug } from "@/lib/topics";

export const alt = "Roadman Cycling Topic Hub";
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
  community: "#9C27B0",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  const title = topic?.headline ?? topic?.title ?? "Topic Hub";
  const description = topic?.description ?? "";
  const pillar = topic?.pillar ?? "coaching";
  const accentColor = pillarColors[pillar] || "#F16363";

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
              color: accentColor,
              fontSize: "20px",
              letterSpacing: "4px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            TOPIC HUB
          </span>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#F5F0EB",
              lineHeight: 1.1,
              marginBottom: "20px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: "22px",
                color: "#A0A0A5",
                lineHeight: 1.4,
                maxWidth: "800px",
              }}
            >
              {description.length > 150
                ? description.slice(0, 150) + "..."
                : description}
            </div>
          )}
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
