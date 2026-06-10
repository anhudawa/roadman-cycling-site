import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Shareable cards for the Fantasy Tour growth loop (Section 8.4).
 * Two variants, both full brand styling:
 *
 *  - team:  "My Roadman Fantasy team" — post-pick share
 *      /api/og/fantasy?card=team&team=Watts%20Occurring&riders=Name|Name|...
 *  - stage: "Stage 14: 187 pts — global top 2%" — post-stage brag
 *      /api/og/fantasy?card=stage&team=...&stage=14&points=187&standing=top%202%25
 *
 * Data arrives via query params so the card needs no DB access and
 * caches at the edge. Nothing sensitive: team name + rider surnames
 * are exactly what the player is choosing to share.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card = searchParams.get("card") === "stage" ? "stage" : "team";
  const team = (searchParams.get("team") || "MY TEAM").slice(0, 40).toUpperCase();
  const riders = (searchParams.get("riders") || "")
    .split("|")
    .filter(Boolean)
    .slice(0, 8);
  const stage = searchParams.get("stage") || "";
  const points = searchParams.get("points") || "";
  const standing = (searchParams.get("standing") || "").slice(0, 30);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(160deg, #210140 0%, #252526 55%, #252526 100%)",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>ROADMAN</span>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, color: "#F16363" }}>
            FANTASY TOUR
          </span>
          <span style={{ fontSize: 18, color: "#9A9A9F", marginLeft: "auto", letterSpacing: 2 }}>
            TOUR DE FRANCE 2026
          </span>
        </div>

        {card === "stage" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 32, letterSpacing: 6, color: "#9A9A9F" }}>
              {team}
            </span>
            <span style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>
              {`STAGE ${stage}: `}
              <span style={{ color: "#F16363" }}>{` ${points} PTS`}</span>
            </span>
            {standing && (
              <span style={{ fontSize: 44, fontWeight: 700, color: "#FAFAFA", letterSpacing: 2 }}>
                {standing.toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>
              {team} <span style={{ color: "#F16363" }}>IS IN.</span>
            </span>
            {riders.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 980 }}>
                {riders.map((rider, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 26,
                      padding: "8px 18px",
                      borderRadius: 8,
                      background: "rgba(250,250,250,0.08)",
                      border: "1px solid rgba(250,250,250,0.18)",
                      letterSpacing: 1,
                    }}
                  >
                    {rider.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 24, color: "#B0B0B5" }}>
            Pick 8 inside 100 credits. Free to play.
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#252526",
              background: "#F16363",
              padding: "12px 26px",
              borderRadius: 8,
              letterSpacing: 3,
            }}
          >
            ROADMANCYCLING.COM/FANTASY
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
