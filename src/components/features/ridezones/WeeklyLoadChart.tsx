"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { shiftDate } from "@/lib/ridezones/load";
import type { AnalyzedActivity } from "@/lib/ridezones/types";

// Single-hue magnitude encoding (validated against the charcoal surface);
// the current, still-incomplete week is de-emphasised.
const BAR_COLOR = "#9C7BE8";
const CURRENT_WEEK_COLOR = "rgba(156,123,232,0.35)";

interface WeekBucket {
  weekStart: string;
  label: string;
  tss: number;
  hours: number;
  rides: number;
}

function mondayOf(iso: string): string {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return shiftDate(iso, -((day + 6) % 7));
}

export function buildWeekBuckets(
  activities: AnalyzedActivity[],
  asOf: string,
  weeks = 16
): WeekBucket[] {
  const currentMonday = mondayOf(asOf);
  const firstMonday = shiftDate(currentMonday, -(weeks - 1) * 7);
  const buckets = new Map<string, WeekBucket>();

  for (let i = 0; i < weeks; i++) {
    const weekStart = shiftDate(firstMonday, i * 7);
    const d = new Date(`${weekStart}T00:00:00Z`);
    buckets.set(weekStart, {
      weekStart,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      tss: 0,
      hours: 0,
      rides: 0,
    });
  }

  for (const ride of activities) {
    const bucket = buckets.get(mondayOf(ride.date));
    if (!bucket) continue;
    bucket.tss += ride.tss;
    bucket.hours += ride.durationSec / 3600;
    bucket.rides += 1;
  }

  return [...buckets.values()].map((b) => ({
    ...b,
    tss: Math.round(b.tss),
    hours: Math.round(b.hours * 10) / 10,
  }));
}

interface TooltipEntry {
  payload?: WeekBucket;
}

function LoadTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  return (
    <div className="rounded-md border border-white/10 bg-[#1B1B1C] px-3 py-2 text-sm shadow-lg">
      <p className="mb-0.5 font-semibold text-off-white">Week of {bucket.label}</p>
      <p className="text-foreground-muted">
        {bucket.tss} TSS · {bucket.hours}h · {bucket.rides} {bucket.rides === 1 ? "ride" : "rides"}
      </p>
    </div>
  );
}

export function WeeklyLoadChart({
  activities,
  asOf,
}: {
  activities: AnalyzedActivity[];
  asOf: string;
}) {
  const data = buildWeekBuckets(activities, asOf);
  const currentMonday = mondayOf(asOf);

  return (
    <div className="h-48 w-full" role="img" aria-label="Weekly training load, last 16 weeks">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }} barCategoryGap={2}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#B0B0B5", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: "#B0B0B5", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<LoadTooltip />} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
          <Bar dataKey="tss" name="Weekly TSS" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((bucket) => (
              <Cell
                key={bucket.weekStart}
                fill={bucket.weekStart === currentMonday ? CURRENT_WEEK_COLOR : BAR_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
