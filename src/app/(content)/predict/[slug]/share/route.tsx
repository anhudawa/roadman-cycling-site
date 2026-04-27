// Shareable Race Predictor result card.
//
// 1080×1920 PNG sized for Instagram stories / Reels covers / WhatsApp status /
// Twitter portrait. Built with `next/og` so the same JSX renders to a static
// PNG via Satori — no client JS, no headless browser.
//
// Why a route handler (not opengraph-image.tsx)? This image is the *deliverable*
// the rider downloads, not OG metadata for the page. Putting it at
// `/predict/[slug]/share` gives a clean shareable URL the user can right-tap
// to save, and avoids polluting the page's actual OpenGraph card.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import {
  getPredictionBySlug,
  getCourseById,
} from "@/lib/race-predictor/store";
import type { Course, Segment } from "@/lib/race-predictor/types";

export const runtime = "nodejs";

const SIZE = { width: 1080, height: 1920 } as const;

const COLORS = {
  deepPurple: "#210140",
  purple: "#4C1273",
  coral: "#F16363",
  charcoal: "#252526",
  offWhite: "#FAFAFA",
} as const;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatToleranceMinutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `±${m} min`;
}

/**
 * Build a small SVG elevation profile path from segments. The card
 * uses a coral fill against the deep-purple background — readable at
 * Instagram-story size on a phone screen.
 */
function buildElevationPath(
  segments: Segment[],
  width: number,
  height: number,
): { area: string; line: string } | null {
  if (!segments.length) return null;

  // Build cumulative distance once, then downsample by index so the path
  // stays small (~120 points) and looks consistent regardless of course
  // length. Sampling preserves accurate horizontal position because we
  // pick exact (distance, elevation) pairs from the real cumulative array.
  const cumulative: number[] = [0];
  for (let i = 0; i < segments.length; i++) {
    cumulative.push(cumulative[i] + segments[i].distance);
  }
  const allElevations: number[] = [segments[0].startElevation];
  for (const s of segments) allElevations.push(s.endElevation);

  const targetPoints = 120;
  const step = Math.max(1, Math.floor(allElevations.length / targetPoints));
  const distances: number[] = [];
  const elevations: number[] = [];
  for (let i = 0; i < allElevations.length; i += step) {
    distances.push(cumulative[i]);
    elevations.push(allElevations[i]);
  }
  // Always include the final endpoint.
  const lastIdx = allElevations.length - 1;
  if (distances[distances.length - 1] !== cumulative[lastIdx]) {
    distances.push(cumulative[lastIdx]);
    elevations.push(allElevations[lastIdx]);
  }

  const totalDistance = distances[distances.length - 1] || 1;
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = Math.max(50, maxElev - minElev);

  const x = (d: number) => (d / totalDistance) * width;
  const y = (e: number) => (1 - (e - minElev) / elevRange) * height;

  const linePoints = elevations
    .map((e, i) => `${x(distances[i]).toFixed(1)},${y(e).toFixed(1)}`)
    .join(" L ");

  const line = `M ${linePoints}`;
  const area = `${line} L ${width.toFixed(1)},${height.toFixed(1)} L 0,${height.toFixed(1)} Z`;

  return { area, line };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);
  if (!prediction) {
    return new Response("Not found", { status: 404 });
  }

  const course = prediction.courseId
    ? await getCourseById(prediction.courseId)
    : null;
  const courseName = course?.name ?? "Your uploaded course";

  const distanceKm = course
    ? course.distanceM / 1000
    : (prediction.courseData?.totalDistance ?? 0) / 1000;
  const elevationGainM = course
    ? course.elevationGainM
    : Math.round(prediction.courseData?.totalElevationGain ?? 0);

  const courseShape: Course | null =
    prediction.courseData ?? course?.courseData ?? null;
  const climbCount = courseShape?.climbs.length ?? 0;

  const tolerance = formatToleranceMinutes(
    (prediction.confidenceHighS - prediction.confidenceLowS) / 2,
  );

  const avgSpeedKmh =
    distanceKm > 0
      ? (distanceKm / (prediction.predictedTimeS / 3600)).toFixed(1)
      : "—";

  const avgPower = prediction.averagePower
    ? `${prediction.averagePower}W`
    : "—";

  const profileWidth = 920;
  const profileHeight = 220;
  const elevationPaths = courseShape
    ? buildElevationPath(courseShape.segments, profileWidth, profileHeight)
    : null;

  const finishTime = formatDuration(prediction.predictedTimeS);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px 60px",
          backgroundColor: COLORS.deepPurple,
          // Layered gradient: top-left coral glow → deep purple base →
          // bottom-right purple lift, plus a subtle "grain" via radial dots.
          backgroundImage: [
            "radial-gradient(circle at 15% 12%, rgba(241,99,99,0.18), transparent 45%)",
            "radial-gradient(circle at 85% 88%, rgba(76,18,115,0.55), transparent 55%)",
            "linear-gradient(180deg, #210140 0%, #1a0033 60%, #210140 100%)",
          ].join(", "),
          fontFamily: "sans-serif",
          color: COLORS.offWhite,
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
            height: "10px",
            background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.purple})`,
          }}
        />

        {/* Header — Roadman wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                color: COLORS.offWhite,
                fontSize: "56px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              ROADMAN
            </span>
            <span
              style={{
                color: COLORS.coral,
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}
            >
              CYCLING · RACE PREDICTOR
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: `3px solid ${COLORS.coral}`,
              backgroundColor: "rgba(241,99,99,0.12)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: COLORS.coral,
              }}
            />
          </div>
        </div>

        {/* Course name + meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "60px",
          }}
        >
          <span
            style={{
              color: "rgba(250,250,250,0.55)",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            COURSE
          </span>
          <span
            style={{
              color: COLORS.offWhite,
              fontSize: courseName.length > 28 ? "64px" : "78px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              lineHeight: 1.04,
              maxWidth: "960px",
            }}
          >
            {courseName}
          </span>
          <span
            style={{
              color: "rgba(250,250,250,0.7)",
              fontSize: "30px",
              fontWeight: 500,
              marginTop: "20px",
              letterSpacing: "0.04em",
            }}
          >
            {distanceKm.toFixed(1)} km · {elevationGainM.toLocaleString()} m
            elevation · {climbCount} climb{climbCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Hero — predicted finish time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(76,18,115,0.45)",
            border: `2px solid rgba(241,99,99,0.35)`,
            borderRadius: "24px",
            padding: "48px 40px",
            marginBottom: "50px",
            boxShadow: "0 0 80px rgba(241,99,99,0.18)",
          }}
        >
          <span
            style={{
              color: "rgba(250,250,250,0.7)",
              fontSize: "26px",
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            PREDICTED FINISH
          </span>
          <span
            style={{
              color: COLORS.offWhite,
              fontSize: finishTime.length > 7 ? "240px" : "280px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              lineHeight: 0.9,
              margin: "0",
            }}
          >
            {finishTime}
          </span>
          <span
            style={{
              color: COLORS.coral,
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              marginTop: "20px",
            }}
          >
            {tolerance}
          </span>
        </div>

        {/* Stat row */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          <Stat label="AVG POWER" value={avgPower} />
          <Stat label="AVG SPEED" value={`${avgSpeedKmh} km/h`} />
          <Stat
            label="CLIMBS"
            value={climbCount > 0 ? climbCount.toString() : "—"}
          />
        </div>

        {/* Mini elevation profile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(250,250,250,0.04)",
            border: "1px solid rgba(250,250,250,0.08)",
            borderRadius: "16px",
            padding: "28px 32px",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              color: COLORS.coral,
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginBottom: "18px",
            }}
          >
            ELEVATION PROFILE
          </span>
          {elevationPaths ? (
            <svg
              width={profileWidth}
              height={profileHeight}
              viewBox={`0 0 ${profileWidth} ${profileHeight}`}
              style={{ display: "block" }}
            >
              <defs>
                <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.coral} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={COLORS.coral} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d={elevationPaths.area} fill="url(#elev-fill)" />
              <path
                d={elevationPaths.line}
                fill="none"
                stroke={COLORS.coral}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <span style={{ color: "rgba(250,250,250,0.4)", fontSize: "22px" }}>
              Profile unavailable
            </span>
          )}
        </div>

        {/* CTA Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.coral,
              borderRadius: "999px",
              padding: "26px 56px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                color: COLORS.deepPurple,
                fontSize: "34px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              GET YOURS AT ROADMANCYCLING.COM/PREDICT
            </span>
          </div>
          <span
            style={{
              color: "rgba(250,250,250,0.5)",
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            FREE · GPX IN · POWER + WEATHER MODELLED
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        // Long-cache by slug — predictions are immutable once made.
        "Cache-Control": "public, max-age=300, s-maxage=86400, immutable",
        "Content-Disposition": `inline; filename="roadman-prediction-${slug}.png"`,
      },
    },
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(250,250,250,0.04)",
        border: "1px solid rgba(250,250,250,0.08)",
        borderRadius: "16px",
        padding: "26px 18px",
      }}
    >
      <span
        style={{
          color: "rgba(250,250,250,0.55)",
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: COLORS.offWhite,
          fontSize: "52px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
