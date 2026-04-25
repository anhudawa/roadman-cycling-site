import { ImageResponse } from "next/og";
import { getEvent } from "@/lib/training-plans";

export const alt = "Roadman Cycling Training Plan";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event: eventSlug } = await params;
  const event = getEvent(eventSlug);

  const name = event?.name ?? "Training Plan";
  const distance = event ? `${event.distanceKm}km` : "";
  const elevation = event ? `${event.elevationGainM.toLocaleString()}m` : "";
  const region = event?.region ?? "";

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                color: "#F16363",
                fontSize: "20px",
                letterSpacing: "4px",
                fontWeight: 600,
              }}
            >
              TRAINING PLAN
            </span>
            {region && (
              <span
                style={{
                  color: "#A0A0A5",
                  fontSize: "20px",
                  letterSpacing: "4px",
                }}
              >
                $· {region.toUpperCase()}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#F5F0EB",
              lineHeight: 1.05,
              marginBottom: "20px",
              maxWidth: "900px",
            }}
          >
            {name.toUpperCase()}
          </div>
          {distance && (
            <div
              style={{
                display: "flex",
                gap: "20px",
                color: "#A0A0A5",
                fontSize: "22px",
                letterSpacing: "2px",
              }}
            >
              <span>{distance}</span>
              <span>$·</span>
              <span>{elevation} climbing</span>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                color: "#F16363",
                fontSize: "18px",
                letterSpacing: "3px",
                fontWeight: 600,
              }}
            >
              ROADMAN CYCLING
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
