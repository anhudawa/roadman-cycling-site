import { ImageResponse } from "next/og";
import { getGuestBySlug } from "@/lib/guests";

export const alt = "Roadman Cycling Guest";
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
  const guest = getGuestBySlug(slug);

  const name = guest?.name ?? "Guest";
  const credential = guest?.credential ?? "";
  const episodes = guest?.episodeCount ?? 0;

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
          <span
            style={{
              color: "#F16363",
              fontSize: "20px",
              letterSpacing: "4px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            PODCAST GUEST
          </span>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#F5F0EB",
              lineHeight: 1.05,
              marginBottom: "16px",
              maxWidth: "900px",
            }}
          >
            {name.toUpperCase()}
          </div>
          {credential && (
            <div
              style={{
                fontSize: "26px",
                color: "#A0A0A5",
                marginBottom: "20px",
                maxWidth: "800px",
              }}
            >
              {credential}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "20px",
              color: "#A0A0A5",
              fontSize: "18px",
              letterSpacing: "2px",
            }}
          >
            <span>
              {episodes} {episodes === 1 ? "EPISODE" : "EPISODES"}
            </span>
            <span>·</span>
            <span>ROADMAN CYCLING</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
