"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { LoadPoint } from "@/lib/ridezones/types";

// Series palette validated for the charcoal surface (dark-mode band,
// CVD separation, contrast) — don't swap without re-running the checks.
const CTL_COLOR = "#9C7BE8";
const ATL_COLOR = "#EF5D5D";
const TSB_COLOR = "#1FA396";

interface FormChartProps {
  load: LoadPoint[];
  /** Days of history to show. */
  days?: number;
}

function formatTick(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-white/10 bg-[#1B1B1C] px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-off-white">{label ? formatTick(label) : ""}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-foreground-muted">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="text-off-white">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function FormChart({ load, days = 112 }: FormChartProps) {
  const data = load.slice(-days);
  if (data.length < 7) {
    return (
      <p className="text-sm text-foreground-muted">
        Not enough days of data yet to draw the fitness timeline.
      </p>
    );
  }

  return (
    <div className="h-72 w-full" role="img" aria-label="Fitness, fatigue and form timeline">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fill: "#B0B0B5", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            minTickGap={48}
          />
          <YAxis
            tick={{ fill: "#B0B0B5", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Legend
            wrapperStyle={{ fontSize: 13, color: "#B0B0B5" }}
            iconType="plainline"
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="ctl"
            name="Fitness (CTL)"
            stroke={CTL_COLOR}
            strokeWidth={2}
            fill={CTL_COLOR}
            fillOpacity={0.12}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="atl"
            name="Fatigue (ATL)"
            stroke={ATL_COLOR}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="tsb"
            name="Form (TSB)"
            stroke={TSB_COLOR}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
