import { ImageResponse } from "next/og";

/**
 * Generates a Roadman R-lettermark icon at the requested size.
 *
 * `maskable: true` lays out the mark inside the central ~62% safe zone so
 * Android adaptive-icon masks (circle, squircle, etc.) don't crop the
 * artwork. Non-maskable icons fill more of the canvas and have a rounded
 * corner radius for iOS/desktop install cards.
 */
export function brandIcon(size: number, maskable: boolean): Response {
  const safeRatio = maskable ? 0.62 : 0.78;
  const fontSize = Math.round(size * safeRatio);
  const speedLineWidth = Math.round(size * (maskable ? 0.42 : 0.52));
  const radius = maskable ? 0 : Math.round(size * 0.18);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #210140 0%, #252526 100%)",
          borderRadius: `${radius}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 900,
              fontFamily: "sans-serif",
              background: "linear-gradient(135deg, #F16363, #4C1273)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
              letterSpacing: `-${Math.round(size * 0.025)}px`,
            }}
          >
            R
          </span>
          <div
            style={{
              width: `${speedLineWidth}px`,
              height: `${Math.max(2, Math.round(size * 0.022))}px`,
              background: "#F16363",
              borderRadius: "2px",
              marginTop: `-${Math.round(size * 0.04)}px`,
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
