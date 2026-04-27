"use client";

import { useMemo, useRef, useState } from "react";
import type { Course, ClimbCategory } from "@/lib/race-predictor/types";

interface SegmentRollup {
  cumDistance: number;
  cumTime: number | null;
  elevation: number;
  gradientPct: number;
  speedKmh: number | null;
  powerW: number | null;
}

interface Props {
  course: Course;
  segmentResults?: {
    duration: number;
    averageSpeed: number;
    riderPower: number;
  }[];
  pacingPlan?: number[] | null;
  height?: number;
}

/**
 * Interactive elevation profile.
 *
 * Renders a coloured-by-gradient SVG profile and a touch/mouse scrubber
 * that reads out distance, elevation, gradient, predicted power, predicted
 * speed, and elapsed time at the cursor. Climb bands are drawn above the
 * profile with category labels. Mobile-first: touch events drive the
 * scrubber on small viewports.
 */
export function InteractiveElevation({
  course,
  segmentResults,
  pacingPlan,
  height = 280,
}: Props) {
  const segments = course.segments;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cursorIdx, setCursorIdx] = useState<number | null>(null);

  const data = useMemo<SegmentRollup[]>(() => {
    let cumDist = 0;
    let cumTime = 0;
    const rollup: SegmentRollup[] = [];
    rollup.push({
      cumDistance: 0,
      cumTime: 0,
      elevation: segments[0]?.startElevation ?? 0,
      gradientPct: segments[0] ? Math.tan(segments[0].gradient) * 100 : 0,
      speedKmh: segmentResults?.[0]
        ? segmentResults[0].averageSpeed * 3.6
        : null,
      powerW:
        segmentResults?.[0]?.riderPower ?? pacingPlan?.[0] ?? null,
    });
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      cumDist += s.distance;
      const sr = segmentResults?.[i];
      if (sr) cumTime += sr.duration;
      rollup.push({
        cumDistance: cumDist,
        cumTime: sr ? cumTime : null,
        elevation: s.endElevation,
        gradientPct: Math.tan(s.gradient) * 100,
        speedKmh: sr ? sr.averageSpeed * 3.6 : null,
        powerW: sr?.riderPower ?? pacingPlan?.[i] ?? null,
      });
    }
    return rollup;
  }, [segments, segmentResults, pacingPlan]);

  const totalDistance = course.totalDistance;
  const elevations = data.map((d) => d.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = Math.max(80, maxElev - minElev);

  const VIEWBOX_W = 1000;
  const VIEWBOX_H = height;
  const padding = { top: 28, right: 14, bottom: 36, left: 52 };
  const innerW = VIEWBOX_W - padding.left - padding.right;
  const innerH = VIEWBOX_H - padding.top - padding.bottom;

  const x = (d: number) => padding.left + (d / totalDistance) * innerW;
  const y = (e: number) =>
    padding.top + (1 - (e - minElev) / elevRange) * innerH;
  const baseY = padding.top + innerH;

  const trapezoids = segments.map((s, i) => {
    const x0 = x(data[i].cumDistance);
    const x1 = x(data[i + 1].cumDistance);
    const y0 = y(data[i].elevation);
    const y1 = y(data[i + 1].elevation);
    return (
      <polygon
        key={i}
        points={`${x0.toFixed(1)},${baseY.toFixed(1)} ${x0.toFixed(1)},${y0.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${baseY.toFixed(1)}`}
        fill={colourForGrade(Math.tan(s.gradient) * 100)}
      />
    );
  });

  const outline = data
    .map((d) => `${x(d.cumDistance).toFixed(1)},${y(d.elevation).toFixed(1)}`)
    .join(" ");

  const climbBands = course.climbs.map((c, idx) => {
    const xStart = x(data[c.startSegmentIndex].cumDistance);
    const xEnd = x(
      data[Math.min(c.endSegmentIndex + 1, data.length - 1)].cumDistance,
    );
    const w = Math.max(2, xEnd - xStart);
    return (
      <g key={idx}>
        <rect
          x={xStart}
          y={padding.top - 18}
          width={w}
          height={6}
          fill="#F16363"
          opacity={0.9}
          rx={1}
        />
        <text
          x={xStart + w / 2}
          y={padding.top - 22}
          fill="#F16363"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight={700}
          textAnchor="middle"
        >
          {climbLabel(c.category)}
        </text>
      </g>
    );
  });

  const yTicks = [
    minElev,
    minElev + elevRange * 0.5,
    minElev + elevRange,
  ];

  function handleMove(clientX: number) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const xVal = padding.left + Math.max(0, Math.min(1, ratio)) * innerW;
    const distAtX = ((xVal - padding.left) / innerW) * totalDistance;
    let nearest = 0;
    let bestDelta = Infinity;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(data[i].cumDistance - distAtX);
      if (d < bestDelta) {
        bestDelta = d;
        nearest = i;
      }
    }
    setCursorIdx(nearest);
  }

  const cursor = cursorIdx !== null ? data[cursorIdx] : null;
  const cursorX = cursor ? x(cursor.cumDistance) : null;
  const cursorY = cursor ? y(cursor.elevation) : null;

  return (
    <div className="select-none">
      <div
        ref={wrapRef}
        className="relative cursor-crosshair touch-none"
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={() => setCursorIdx(null)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onTouchMove={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={() => setCursorIdx(null)}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="w-full h-auto block"
          role="img"
          aria-label={`Elevation profile: ${(totalDistance / 1000).toFixed(0)} km, ${Math.round(course.totalElevationGain)} m gain`}
          preserveAspectRatio="none"
        >
          {/* Y grid */}
          {yTicks.map((t, i) => (
            <line
              key={i}
              x1={padding.left}
              x2={VIEWBOX_W - padding.right}
              y1={y(t)}
              y2={y(t)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {/* Gradient-coloured terrain */}
          {trapezoids}
          {/* Climb bands above */}
          {climbBands}
          {/* Outline */}
          <polyline
            points={outline}
            fill="none"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
          {/* Y-axis labels */}
          {yTicks.map((t, i) => (
            <text
              key={i}
              x={padding.left - 8}
              y={y(t) + 4}
              fill="rgba(255,255,255,0.5)"
              fontSize="11"
              textAnchor="end"
              fontFamily="system-ui"
            >
              {Math.round(t)} m
            </text>
          ))}
          {/* X-axis distance labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
            <text
              key={i}
              x={x(totalDistance * f)}
              y={VIEWBOX_H - 12}
              fill="rgba(255,255,255,0.5)"
              fontSize="11"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              {((totalDistance * f) / 1000).toFixed(0)} km
            </text>
          ))}
          {/* Cursor line + dot */}
          {cursor && cursorX !== null && cursorY !== null && (
            <g>
              <line
                x1={cursorX}
                x2={cursorX}
                y1={padding.top}
                y2={baseY}
                stroke="#F16363"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.9}
              />
              <circle
                cx={cursorX}
                cy={cursorY}
                r={5}
                fill="#F16363"
                stroke="#FAFAFA"
                strokeWidth={1.5}
              />
            </g>
          )}
        </svg>

        {/* Floating tooltip */}
        {cursor && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -top-2 z-10"
            style={{
              left: `${(cursor.cumDistance / totalDistance) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-deep-purple/95 border border-coral/50 rounded-md px-3 py-2 text-xs text-off-white shadow-[var(--shadow-elevated)] whitespace-nowrap backdrop-blur">
              <div className="font-display text-base text-coral leading-none mb-1">
                km {(cursor.cumDistance / 1000).toFixed(1)}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <span className="text-off-white/60">elev</span>
                <span className="text-right">{Math.round(cursor.elevation)} m</span>
                <span className="text-off-white/60">grade</span>
                <span
                  className="text-right"
                  style={{ color: gradeText(cursor.gradientPct) }}
                >
                  {cursor.gradientPct >= 0 ? "+" : ""}
                  {cursor.gradientPct.toFixed(1)}%
                </span>
                {cursor.speedKmh !== null && (
                  <>
                    <span className="text-off-white/60">speed</span>
                    <span className="text-right">{cursor.speedKmh.toFixed(1)} km/h</span>
                  </>
                )}
                {cursor.powerW !== null && (
                  <>
                    <span className="text-off-white/60">power</span>
                    <span className="text-right">{Math.round(cursor.powerW)} W</span>
                  </>
                )}
                {cursor.cumTime !== null && (
                  <>
                    <span className="text-off-white/60">time</span>
                    <span className="text-right">{formatTime(cursor.cumTime)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend + climb chips */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-[11px] text-off-white/55">
          <Swatch color="#5EAEE0" label="downhill" />
          <Swatch color="#3FB67A" label="≤2%" />
          <Swatch color="#F2B742" label="2–5%" />
          <Swatch color="#F16363" label="5–8%" />
          <Swatch color="#B22A2A" label="≥8%" />
        </div>
        <p className="text-[11px] text-off-white/40 hidden sm:block">
          Drag across the profile to scrub.
        </p>
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

function colourForGrade(gradePct: number): string {
  if (gradePct < -3) return "rgba(45, 132, 220, 0.55)";
  if (gradePct < -1) return "rgba(94, 174, 224, 0.45)";
  if (gradePct <= 2) return "rgba(63, 182, 122, 0.55)";
  if (gradePct <= 5) return "rgba(242, 183, 66, 0.65)";
  if (gradePct <= 8) return "rgba(241, 99, 99, 0.75)";
  return "rgba(178, 42, 42, 0.9)";
}

function gradeText(gradePct: number): string {
  if (gradePct < -1) return "#5EAEE0";
  if (gradePct <= 2) return "#3FB67A";
  if (gradePct <= 5) return "#F2B742";
  if (gradePct <= 8) return "#F16363";
  if (gradePct > 8) return "#FF8585";
  return "#FAFAFA";
}

function climbLabel(cat: ClimbCategory): string {
  switch (cat) {
    case "cat4":
      return "4";
    case "cat3":
      return "3";
    case "cat2":
      return "2";
    case "cat1":
      return "1";
    case "hc":
      return "HC";
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
