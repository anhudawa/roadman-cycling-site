// OpenGraph / Twitter card for a personal Race Predictor result.
//
// 1200×630 landscape PNG sized for social-share unfurls (Twitter/X, Facebook,
// LinkedIn, WhatsApp, iMessage). Built with `next/og` (Satori) following the
// repo's `opengraph-image.tsx` file-convention — Next.js automatically emits
// both `og:image` and `twitter:image` tags (with width/height/type) from this
// file, so no manual image URL wiring is needed in `generateMetadata`.
//
// This is distinct from `share/route.tsx`, which renders a 1080×1920 portrait
// poster as a *downloadable deliverable* for Instagram stories. That aspect
// ratio crops badly in feed unfurls, so social metadata uses this card instead.

import { ImageResponse } from "next/og";
import {
  getPredictionBySlug,
  getCourseById,
  getCourseBySlug,
} from "@/lib/race-predictor/store";
import type { Course, Segment } from "@/lib/race-predictor/types";

export const runtime = "nodejs";

export const alt = "Roadman Cycling Race Predictor result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  deepPurple: "#210140",
  purple: "#4C1273",
  coral: "#F16363",
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
 * Build a small SVG elevation profile path from segments — a coral fill against
 * the deep-purple background, downsampled to ~120 points so it stays cheap and
 * looks consistent regardless of course length.
 */
function buildElevationPath(
  segments: Segment[],
  width: number,
  height: number,
): { area: string; line: string } | null {
  if (!segments.length) return null;

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

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug).catch(() => null);

  // Curated event landing pages (no personal prediction) fall back to a generic
  // branded card so the route convention still resolves cleanly.
  if (!prediction) {
    const eventCourse = await getCourseBySlug(slug).catch(() => null);
    return renderGenericCard(eventCourse?.name ?? null);
  }

  const course = prediction.courseId
    ? await getCourseById(prediction.courseId).catch(() => null)
    : null;
  const courseName = course?.name ?? "Your uploaded course";

  const courseShape: Course | null =
    (course?.courseData as Course | undefined) ?? prediction.courseData ?? null;

  const distanceKm = courseShape
    ? courseShape.totalDistance / 1000
    : course
      ? course.distanceM / 1000
      : 0;
  const elevationGainM = courseShape
    ? Math.round(courseShape.totalElevationGain)
    : course
      ? course.elevationGainM
      : 0;
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

  const profileWidth = 1080;
  const profileHeight = 120;
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
          padding: "56px 60px",
          backgroundColor: COLORS.deepPurple,
          backgroundImage: [
            "radial-gradient(circle at 12% 10%, rgba(241,99,99,0.20), transparent 45%)",
            "radial-gradient(circle at 88% 92%, rgba(76,18,115,0.55), transparent 55%)",
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
            height: "8px",
            background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.purple})`,
          }}
        />

        {/* Header — Roadman wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: COLORS.offWhite,
                fontSize: "40px",
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
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: "5px",
              }}
            >
              CYCLING · RACE PREDICTOR
            </span>
          </div>
          <span
            style={{
              color: "rgba(250,250,250,0.5)",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            roadmancycling.com/predict
          </span>
        </div>

        {/* Body — finish time hero + course meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
            marginTop: "8px",
          }}
        >
          {/* Predicted finish */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "rgba(76,18,115,0.45)",
              border: `2px solid rgba(241,99,99,0.35)`,
              borderRadius: "20px",
              padding: "28px 40px",
            }}
          >
            <span
              style={{
                color: "rgba(250,250,250,0.7)",
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              PREDICTED FINISH
            </span>
            <span
              style={{
                color: COLORS.offWhite,
                fontSize: "132px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                lineHeight: 0.9,
              }}
            >
              {finishTime}
            </span>
            <span
              style={{
                color: COLORS.coral,
                fontSize: "30px",
                fontWeight: 700,
                marginTop: "12px",
              }}
            >
              {tolerance}
            </span>
          </div>

          {/* Course name + stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <span
              style={{
                color: "rgba(250,250,250,0.55)",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              COURSE
            </span>
            <span
              style={{
                color: COLORS.offWhite,
                fontSize: courseName.length > 24 ? "40px" : "52px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                lineHeight: 1.02,
              }}
            >
              {courseName}
            </span>
            <span
              style={{
                color: "rgba(250,250,250,0.7)",
                fontSize: "20px",
                fontWeight: 500,
                marginTop: "12px",
              }}
            >
              {distanceKm.toFixed(1)} km · {elevationGainM.toLocaleString()} m ·{" "}
              {climbCount} climb{climbCount === 1 ? "" : "s"}
            </span>

            {/* Stat row */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Stat label="AVG POWER" value={avgPower} />
              <Stat label="AVG SPEED" value={`${avgSpeedKmh} km/h`} />
              <Stat
                label="CLIMBS"
                value={climbCount > 0 ? climbCount.toString() : "—"}
              />
            </div>
          </div>
        </div>

        {/* Mini elevation profile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          {elevationPaths ? (
            <svg
              width={profileWidth}
              height={profileHeight}
              viewBox={`0 0 ${profileWidth} ${profileHeight}`}
              style={{ display: "block" }}
            >
              <defs>
                <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.coral} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={COLORS.coral} stopOpacity="0.04" />
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
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}

function renderGenericCard(courseName: string | null) {
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
          backgroundColor: COLORS.deepPurple,
          backgroundImage: [
            "radial-gradient(circle at 15% 12%, rgba(241,99,99,0.18), transparent 45%)",
            "linear-gradient(135deg, #210140 0%, #1a0033 55%, #210140 100%)",
          ].join(", "),
          fontFamily: "sans-serif",
          color: COLORS.offWhite,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.purple})`,
          }}
        />
        <span
          style={{
            color: COLORS.coral,
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          ROADMAN · RACE PREDICTOR
        </span>
        <span
          style={{
            color: COLORS.offWhite,
            fontSize: courseName && courseName.length > 24 ? "64px" : "84px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            lineHeight: 1.02,
            maxWidth: "1000px",
          }}
        >
          {courseName ?? "Predict your finish time"}
        </span>
        <span
          style={{
            color: "rgba(250,250,250,0.7)",
            fontSize: "28px",
            fontWeight: 500,
            marginTop: "20px",
          }}
        >
          Free finish-time prediction · GPX in · power + weather modelled
        </span>
      </div>
    ),
    { ...size },
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
        borderRadius: "14px",
        padding: "16px 12px",
      }}
    >
      <span
        style={{
          color: "rgba(250,250,250,0.55)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: COLORS.offWhite,
          fontSize: "34px",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
