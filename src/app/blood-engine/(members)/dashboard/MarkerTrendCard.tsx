"use client";

import {
  Area,
  AreaChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import type { MarkerTrend } from "@/lib/blood-engine/trends";

interface Props {
  trend: MarkerTrend;
}

const STATUS_COLOR: Record<NonNullable<MarkerTrend["latestStatus"]>, string> = {
  optimal: "#10b981", // emerald-500
  suboptimal: "#fbbf24", // amber-400
  flag: "#F16363", // coral
};

const ARROW: Record<MarkerTrend["direction"], string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export function MarkerTrendCard({ trend }: Props) {
  const color = STATUS_COLOR[trend.latestStatus ?? "suboptimal"] ?? "#9A9A9F";
  const latest = trend.points[trend.points.length - 1];
  const first = trend.points[0];
  const data = trend.points.map((p) => ({ ...p }));

  // Y-axis bounds for the optimal band shading.
  const allValues = trend.points.map((p) => p.value);
  const minV = Math.min(...allValues, trend.optimalLow ?? Infinity);
  const maxV = Math.max(...allValues, trend.optimalHigh ?? -Infinity);
  const pad = (maxV - minV || 1) * 0.15;
  const yMin = minV - pad;
  const yMax = maxV + pad;

  return (
    <div className="rounded-lg border border-white/10 bg-background-elevated p-5">
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="font-heading uppercase text-off-white text-lg leading-tight">
          {trend.displayName}
        </h3>
        <span
          className="font-heading text-xl tabular-nums"
          style={{ color }}
          aria-label={`Trend ${trend.direction}`}
        >
          {ARROW[trend.direction]}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-heading text-3xl tabular-nums" style={{ color }}>
          {formatValue(latest.value)}
        </span>
        <span className="text-xs text-foreground-subtle">{trend.canonicalUnit}</span>
        <span className="text-xs text-foreground-subtle ml-auto">
          from {formatValue(first.value)}
        </span>
      </div>
      <div className="h-20 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id={`grad-${trend.markerId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {trend.optimalLow !== null && trend.optimalHigh !== null ? (
              <ReferenceArea
                y1={trend.optimalLow}
                y2={trend.optimalHigh}
                fill="#10b981"
                fillOpacity={0.08}
                stroke="none"
                ifOverflow="hidden"
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${trend.markerId})`}
              dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Tooltip
              cursor={{ stroke: "#FAFAFA22" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded bg-charcoal border border-white/10 px-2.5 py-1.5 text-xs">
                    <div className="text-off-white tabular-nums">
                      {formatValue(p.value)} {trend.canonicalUnit}
                    </div>
                    <div className="text-foreground-subtle">{p.drawDate}</div>
                  </div>
                );
              }}
            />
            {/* Hidden y-domain to apply yMin/yMax */}
            <YDomain yMin={yMin} yMax={yMax} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-foreground-subtle mt-2">
        Optimal:{" "}
        {trend.optimalLow !== null && trend.optimalHigh !== null
          ? `${trend.optimalLow}–${trend.optimalHigh}`
          : trend.optimalLow !== null
            ? `>${trend.optimalLow}`
            : trend.optimalHigh !== null
              ? `<${trend.optimalHigh}`
              : "—"}{" "}
        {trend.canonicalUnit}
      </p>
    </div>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

// Hidden y-axis just to clamp the domain — Recharts has no shorter way to do
// this when there's no visible axis.
function YDomain({ yMin, yMax }: { yMin: number; yMax: number }) {
  return <YAxis hide domain={[yMin, yMax]} />;
}
