"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/lib/race-predictor/types";

interface ElevationProfileProps {
  course: Course;
  height?: number;
  /** Smoothing — number of x-axis samples. */
  samples?: number;
  /** Optional power overlay aligned to segments. */
  power?: number[];
  /** Optional speed overlay (m/s) aligned to segments. */
  speed?: number[];
  /** Mark cutoff time (in km) with a dashed vertical guide. */
  cutoffKm?: number;
  className?: string;
  showClimbBands?: boolean;
}

const GRADIENT_COLORS: { ceil: number; color: string }[] = [
  { ceil: 0.02, color: "#10B981" }, // emerald — flat
  { ceil: 0.05, color: "#FBBF24" }, // amber — moderate
  { ceil: 0.08, color: "#F97316" }, // orange — steep
  { ceil: Infinity, color: "#EF4444" }, // red — brutal
];

const CLIMB_COLORS: Record<string, string> = {
  cat4: "rgba(251, 191, 36, 0.10)",
  cat3: "rgba(249, 115, 22, 0.12)",
  cat2: "rgba(239, 68, 68, 0.16)",
  cat1: "rgba(220, 38, 38, 0.20)",
  hc: "rgba(127, 29, 29, 0.32)",
};

function gradientColor(rad: number): string {
  const g = Math.abs(rad);
  for (const tier of GRADIENT_COLORS) if (g <= tier.ceil) return tier.color;
  return "#EF4444";
}

interface SamplePoint {
  km: number;
  elevation: number;
  gradient: number;
  power?: number;
  speed?: number;
  segmentIdx: number;
}

/**
 * Premium interactive elevation profile.
 *
 * Renders the course as a coral-gradient area with per-band gradient colouring
 * underneath, climb shading overlays, and an optional power/speed line. Hover
 * reveals a vertical scrub line with km/elevation/gradient/power readouts.
 */
export function ElevationProfile({
  course,
  height = 320,
  samples = 240,
  power,
  speed,
  cutoffKm,
  className = "",
  showClimbBands = true,
}: ElevationProfileProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [width, setWidth] = useState(800);

  const data = useMemo(() => {
    const segs = course.segments;
    if (segs.length === 0) {
      return {
        points: [] as SamplePoint[],
        minElev: 0,
        maxElev: 0,
        bands: [] as { x0: number; x1: number; color: string }[],
      };
    }
    const total = course.totalDistance;
    let minElev = Infinity;
    let maxElev = -Infinity;
    for (const s of segs) {
      if (s.startElevation < minElev) minElev = s.startElevation;
      if (s.endElevation < minElev) minElev = s.endElevation;
      if (s.startElevation > maxElev) maxElev = s.startElevation;
      if (s.endElevation > maxElev) maxElev = s.endElevation;
    }

    const points: SamplePoint[] = [];
    let segIdx = 0;
    let distAcc = 0;
    for (let i = 0; i <= samples; i++) {
      const target = (i / samples) * total;
      while (segIdx < segs.length - 1 && distAcc + segs[segIdx].distance < target) {
        distAcc += segs[segIdx].distance;
        segIdx++;
      }
      const seg = segs[segIdx];
      const localT = seg.distance > 0 ? (target - distAcc) / seg.distance : 0;
      const elev = seg.startElevation + (seg.endElevation - seg.startElevation) * localT;
      points.push({
        km: target / 1000,
        elevation: elev,
        gradient: seg.gradient,
        power: power?.[seg.index],
        speed: speed?.[seg.index],
        segmentIdx: seg.index,
      });
    }

    // Pre-compute bands for the under-fill colour by gradient.
    const bands: { x0: number; x1: number; color: string }[] = [];
    let curStart = 0;
    let curColor = gradientColor(points[0].gradient);
    for (let i = 1; i < points.length; i++) {
      const c = gradientColor(points[i].gradient);
      if (c !== curColor) {
        bands.push({ x0: points[curStart].km, x1: points[i].km, color: curColor });
        curStart = i;
        curColor = c;
      }
    }
    bands.push({
      x0: points[curStart].km,
      x1: points[points.length - 1].km,
      color: curColor,
    });

    return { points, minElev, maxElev, bands };
  }, [course, samples, power, speed]);

  if (data.points.length === 0) {
    return (
      <div
        className={className}
        style={{ height }}
        aria-label="Course profile unavailable"
      />
    );
  }

  const totalKm = course.totalDistance / 1000;
  const span = Math.max(data.maxElev - data.minElev, 30);
  const padTop = 24;
  const padBottom = 28;
  const padLeft = 44;
  const padRight = 16;
  const chartH = height - padTop - padBottom;
  const chartW = width - padLeft - padRight;

  const xFor = (km: number) => padLeft + (km / totalKm) * chartW;
  const yFor = (elev: number) =>
    padTop + chartH - ((elev - data.minElev) / span) * chartH;

  const linePath =
    "M " +
    data.points
      .map((p, i) => {
        const x = xFor(p.km).toFixed(2);
        const y = yFor(p.elevation).toFixed(2);
        return i === 0 ? `${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");

  const fillPath =
    `M ${xFor(data.points[0].km).toFixed(2)} ${(padTop + chartH).toFixed(2)} ` +
    "L " +
    data.points
      .map((p) => `${xFor(p.km).toFixed(2)} ${yFor(p.elevation).toFixed(2)}`)
      .join(" L ") +
    ` L ${xFor(data.points[data.points.length - 1].km).toFixed(2)} ${(padTop + chartH).toFixed(2)} Z`;

  // Power line (optional)
  const maxPower =
    power && power.length > 0
      ? Math.max(...power.filter((p) => Number.isFinite(p)), 1)
      : 0;
  const powerPath =
    power && power.length > 0
      ? "M " +
        data.points
          .map((p, i) => {
            if (p.power == null) return "";
            const x = xFor(p.km).toFixed(2);
            const y = (padTop + chartH - (p.power / maxPower) * (chartH * 0.7)).toFixed(2);
            return i === 0 ? `${x} ${y}` : `L ${x} ${y}`;
          })
          .filter(Boolean)
          .join(" ")
      : null;

  // Y-axis ticks
  const yTicks: number[] = [];
  const tickStep = Math.ceil(span / 4 / 100) * 100 || 100;
  for (let v = Math.ceil(data.minElev / tickStep) * tickStep; v <= data.maxElev; v += tickStep) {
    yTicks.push(v);
  }

  // X-axis ticks (every ~25% of distance)
  const xTickCount = totalKm > 200 ? 5 : totalKm > 50 ? 4 : 3;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => (i * totalKm) / xTickCount);

  const hovered = hoverIdx != null ? data.points[hoverIdx] : null;
  const hoverX = hovered ? xFor(hovered.km) : 0;
  const hoverY = hovered ? yFor(hovered.elevation) : 0;

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height }}
        ref={(el) => {
          if (el && el.clientWidth > 0 && el.clientWidth !== width) {
            setWidth(el.clientWidth);
          }
        }}
        onPointerMove={(e) => {
          const target = e.currentTarget;
          const rect = target.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * width;
          const km = ((relX - padLeft) / chartW) * totalKm;
          if (km < 0 || km > totalKm) {
            setHoverIdx(null);
            return;
          }
          const idx = Math.round((km / totalKm) * samples);
          setHoverIdx(Math.max(0, Math.min(samples, idx)));
        }}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F16363" stopOpacity="0.42" />
            <stop offset="60%" stopColor="#F16363" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#F16363" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="elev-clip">
            <path d={fillPath} />
          </clipPath>
        </defs>

        {/* Grid + axis labels */}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line
              x1={padLeft}
              x2={padLeft + chartW}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={padLeft - 8}
              y={yFor(v) + 4}
              textAnchor="end"
              className="fill-foreground-subtle"
              style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {Math.round(v)}m
            </text>
          </g>
        ))}
        {xTicks.map((km, i) => (
          <text
            key={`x-${i}`}
            x={xFor(km)}
            y={height - 8}
            textAnchor="middle"
            className="fill-foreground-subtle"
            style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {Math.round(km)}km
          </text>
        ))}

        {/* Climb bands behind everything */}
        {showClimbBands &&
          course.climbs.map((c, i) => {
            const x0 = xFor(c.startDistance / 1000);
            const x1 = xFor(c.endDistance / 1000);
            const color = CLIMB_COLORS[c.category] ?? "rgba(241,99,99,0.1)";
            return (
              <rect
                key={`climb-${i}`}
                x={x0}
                y={padTop}
                width={Math.max(x1 - x0, 1)}
                height={chartH}
                fill={color}
              />
            );
          })}

        {/* Gradient-colored under-fill bands, clipped to elevation profile */}
        <g clipPath="url(#elev-clip)">
          {data.bands.map((b, i) => (
            <rect
              key={`band-${i}`}
              x={xFor(b.x0)}
              y={padTop}
              width={xFor(b.x1) - xFor(b.x0)}
              height={chartH}
              fill={b.color}
              opacity={0.18}
            />
          ))}
        </g>

        {/* Coral fill on top */}
        <path d={fillPath} fill="url(#elev-fill)" />
        {/* Outline */}
        <path
          d={linePath}
          fill="none"
          stroke="#F16363"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Power overlay (cyan) */}
        {powerPath && (
          <path
            d={powerPath}
            fill="none"
            stroke="rgba(56, 189, 248, 0.85)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        )}

        {/* Climb labels */}
        {course.climbs.map((c, i) => {
          const midKm = (c.startDistance + c.endDistance) / 2 / 1000;
          return (
            <text
              key={`climb-label-${i}`}
              x={xFor(midKm)}
              y={padTop + 14}
              textAnchor="middle"
              className="fill-off-white"
              style={{
                fontSize: 9,
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                opacity: 0.55,
              }}
            >
              {c.category.toUpperCase()} · {(c.length / 1000).toFixed(1)}KM @ {(c.averageGradient * 100).toFixed(1)}%
            </text>
          );
        })}

        {/* Cutoff guide */}
        {cutoffKm != null && (
          <g>
            <line
              x1={xFor(cutoffKm)}
              x2={xFor(cutoffKm)}
              y1={padTop}
              y2={padTop + chartH}
              stroke="#FBBF24"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={xFor(cutoffKm)}
              y={padTop - 6}
              textAnchor="middle"
              fill="#FBBF24"
              style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
            >
              CUTOFF
            </text>
          </g>
        )}

        {/* Hover scrub line */}
        {hovered && (
          <g pointerEvents="none">
            <line
              x1={hoverX}
              x2={hoverX}
              y1={padTop}
              y2={padTop + chartH}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1}
            />
            <circle cx={hoverX} cy={hoverY} r={4} fill="#F16363" />
            <circle cx={hoverX} cy={hoverY} r={8} fill="#F16363" opacity={0.3} />
          </g>
        )}
      </svg>

      {/* Hover readout panel */}
      {hovered && (
        <div
          className="pointer-events-none absolute top-2 right-2 rounded-md bg-charcoal/90 backdrop-blur-md border border-white/10 px-3 py-2 text-xs shadow-[var(--shadow-card)]"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          <div className="flex items-center gap-3 text-off-white">
            <span className="text-foreground-subtle">KM</span>
            <span>{hovered.km.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3 text-off-white">
            <span className="text-foreground-subtle">ELEV</span>
            <span>{Math.round(hovered.elevation)}m</span>
          </div>
          <div className="flex items-center gap-3 text-off-white">
            <span className="text-foreground-subtle">GRAD</span>
            <span style={{ color: gradientColor(hovered.gradient) }}>
              {(hovered.gradient * 100).toFixed(1)}%
            </span>
          </div>
          {hovered.power != null && (
            <div className="flex items-center gap-3 text-off-white">
              <span className="text-foreground-subtle">PWR</span>
              <span>{Math.round(hovered.power)}W</span>
            </div>
          )}
          {hovered.speed != null && (
            <div className="flex items-center gap-3 text-off-white">
              <span className="text-foreground-subtle">SPD</span>
              <span>{(hovered.speed * 3.6).toFixed(1)}km/h</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
