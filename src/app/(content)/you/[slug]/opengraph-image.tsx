import { ImageResponse } from "next/og";
import { PERSONAS, type PersonaSlug } from "@/lib/personas";

export const alt = "Roadman Cycling";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const persona = PERSONAS[slug as PersonaSlug];

  const headline = persona?.headline ?? "Find Your Path";
  const subheading = persona?.subheading ?? "";
  const kicker = persona?.kicker ?? "";

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
            background: "linear-gradient(90deg, #F16363, #4C1273)",
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
          {kicker && (
            <span
              style={{
                color: "#F16363",
                fontSize: "20px",
                letterSpacing: "4px",
                fontWeight: 600,
                marginBottom: "24px",
              }}
            >
              {kicker.toUpperCase()}
            </span>
          )}
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
            {headline}
          </div>
          {subheading && (
            <div
              style={{
                fontSize: "22px",
                color: "#A0A0A5",
                lineHeight: 1.4,
                maxWidth: "800px",
              }}
            >
              {subheading.length > 150
                ? subheading.slice(0, 150) + "..."
                : subheading}
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
