"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AGE_GROUPS,
  type AgeGroup,
  FTP_BY_AGE,
  FTP_IMPROVEMENT_RATES,
  type PercentileRow,
  REPORT_META,
  SPORTIVE_TIERS,
  TRAINING_HOURS_BY_GOAL,
  WKG_BY_AGE,
} from "@/data/benchmarks";

const COLORS = {
  offWhite: "#FAFAFA",
  coral: "#F16363",
  purple: "#4C1273",
  midGrey: "#545559",
  charcoal: "#252526",
  deepPurple: "#210140",
  // Percentile colour ramp — coldest (25th) to brightest (90th).
  p25: "#545559",
  p50: "#4C1273",
  p75: "#A23E8C",
  p90: "#F16363",
};

interface PercentileTooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: { ageGroup: string };
}

function PercentileTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: PercentileTooltipPayload[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const labels: Record<string, string> = {
    p25: "25th percentile",
    p50: "50th (median)",
    p75: "75th percentile",
    p90: "90th percentile",
  };
  return (
    <div className="bg-charcoal/95 border border-white/10 rounded-lg p-3 backdrop-blur-sm shadow-lg">
      <p className="font-heading text-xs text-coral tracking-widest mb-2">
        AGE {label}
      </p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-foreground-muted">{labels[p.dataKey]}</span>
            <span className="font-heading text-off-white ml-auto">
              {p.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PercentileChartProps {
  data: PercentileRow[];
  unit: string;
  yAxisLabel: string;
}

export function PercentileChart({ data, unit, yAxisLabel }: PercentileChartProps) {
  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4 md:p-6">
      <div className="h-72 md:h-96 w-full" aria-label={yAxisLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -8, bottom: 8 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="ageGroup"
              tick={{ fill: COLORS.offWhite, fontSize: 12, fontFamily: "Bebas Neue, sans-serif" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9A9A9F", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "rgba(241,99,99,0.08)" }}
              content={<PercentileTooltip unit={unit} />}
            />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 11, color: "#B0B0B5", fontFamily: "Work Sans, sans-serif" }}
              formatter={(v) => {
                const map: Record<string, string> = {
                  p25: "25th",
                  p50: "50th (median)",
                  p75: "75th",
                  p90: "90th",
                };
                return map[v] ?? v;
              }}
            />
            <Bar dataKey="p25" fill={COLORS.p25} radius={[3, 3, 0, 0]} />
            <Bar dataKey="p50" fill={COLORS.p50} radius={[3, 3, 0, 0]} />
            <Bar dataKey="p75" fill={COLORS.p75} radius={[3, 3, 0, 0]} />
            <Bar dataKey="p90" fill={COLORS.p90} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface AgeHighlightProps {
  selected: AgeGroup | "all";
  onSelect: (age: AgeGroup | "all") => void;
}

export function AgeHighlight({ selected, onSelect }: AgeHighlightProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-foreground-subtle text-xs font-heading tracking-widest mr-2">
        HIGHLIGHT YOUR AGE:
      </span>
      <button
        onClick={() => onSelect("all")}
        className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider transition-colors cursor-pointer ${
          selected === "all"
            ? "bg-coral text-off-white"
            : "bg-white/5 text-foreground-muted hover:bg-white/10"
        }`}
      >
        ALL
      </button>
      {AGE_GROUPS.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider transition-colors cursor-pointer ${
            selected === g
              ? "bg-coral text-off-white"
              : "bg-white/5 text-foreground-muted hover:bg-white/10"
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

interface PercentileTableProps {
  rows: PercentileRow[];
  highlight: AgeGroup | "all";
  unit: string;
  caption: string;
  decimals?: 0 | 1;
}

export function PercentileTable({
  rows,
  highlight,
  unit,
  caption,
  decimals = 0,
}: PercentileTableProps) {
  const fmt = (n: number) =>
    decimals === 1 ? n.toFixed(1) : Math.round(n).toString();
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-background-elevated">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-white/10">
            <th
              scope="col"
              className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle"
            >
              AGE
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right"
            >
              25TH
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right"
            >
              50TH (MEDIAN)
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right"
            >
              75TH
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-heading text-xs tracking-widest text-coral text-right"
            >
              90TH
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isHighlight = highlight === r.ageGroup;
            return (
              <tr
                key={r.ageGroup}
                className={`border-b border-white/5 last:border-b-0 transition-colors ${
                  isHighlight ? "bg-coral/10" : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-3 font-heading text-off-white">
                  {r.ageGroup}
                </td>
                <td className="px-4 py-3 text-right text-foreground-muted">
                  {fmt(r.p25)}
                  {unit}
                </td>
                <td className="px-4 py-3 text-right text-off-white">
                  {fmt(r.p50)}
                  {unit}
                </td>
                <td className="px-4 py-3 text-right text-foreground-muted">
                  {fmt(r.p75)}
                  {unit}
                </td>
                <td className="px-4 py-3 text-right font-heading text-coral">
                  {fmt(r.p90)}
                  {unit}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function FTPSection() {
  const [age, setAge] = useState<AgeGroup | "all">("all");
  return (
    <div>
      <AgeHighlight selected={age} onSelect={setAge} />
      <div className="grid lg:grid-cols-2 gap-6">
        <PercentileChart
          data={FTP_BY_AGE}
          unit="W"
          yAxisLabel="FTP in watts by age group"
        />
        <PercentileTable
          rows={FTP_BY_AGE}
          highlight={age}
          unit="W"
          caption="FTP percentiles by age group, watts"
        />
      </div>
    </div>
  );
}

export function WkgSection() {
  const [age, setAge] = useState<AgeGroup | "all">("all");
  return (
    <div>
      <AgeHighlight selected={age} onSelect={setAge} />
      <div className="grid lg:grid-cols-2 gap-6">
        <PercentileChart
          data={WKG_BY_AGE}
          unit=""
          yAxisLabel="Watts per kilo by age group"
        />
        <PercentileTable
          rows={WKG_BY_AGE}
          highlight={age}
          unit=""
          caption="W/kg percentiles by age group"
          decimals={1}
        />
      </div>
    </div>
  );
}

export function TrainingHoursChart() {
  const data = TRAINING_HOURS_BY_GOAL.map((r) => ({
    name: r.goalShort,
    low: r.weeklyHoursLow,
    typical: r.weeklyHoursTypical - r.weeklyHoursLow,
    high: r.weeklyHoursHigh - r.weeklyHoursTypical,
    fullLow: r.weeklyHoursLow,
    fullHigh: r.weeklyHoursHigh,
    typicalAbs: r.weeklyHoursTypical,
  }));
  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4 md:p-6">
      <div className="h-80 w-full" aria-label="Weekly training hours by goal">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            barCategoryGap="22%"
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#9A9A9F", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 16]}
              label={{
                value: "Hours per week",
                position: "insideBottom",
                offset: -2,
                fill: "#9A9A9F",
                fontSize: 11,
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: COLORS.offWhite, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={170}
            />
            <Tooltip
              cursor={{ fill: "rgba(241,99,99,0.08)" }}
              content={({
                active,
                payload,
              }: {
                active?: boolean;
                payload?: Array<{
                  payload: {
                    name: string;
                    fullLow: number;
                    fullHigh: number;
                    typicalAbs: number;
                  };
                }>;
              }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-charcoal/95 border border-white/10 rounded-lg p-3 backdrop-blur-sm shadow-lg">
                    <p className="font-heading text-xs text-coral tracking-widest mb-2">
                      {p.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Range:{" "}
                      <span className="text-off-white font-heading">
                        {p.fullLow}-{p.fullHigh}h/week
                      </span>
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Typical:{" "}
                      <span className="text-coral font-heading">
                        {p.typicalAbs}h/week
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="low" stackId="a" fill="transparent" />
            <Bar dataKey="typical" stackId="a" fill={COLORS.purple}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS.purple} />
              ))}
            </Bar>
            <Bar
              dataKey="high"
              stackId="a"
              fill={COLORS.coral}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-foreground-subtle">
        <span className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.purple }}
          />
          Typical
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.coral }}
          />
          Stretch / build phase
        </span>
      </div>
    </div>
  );
}

export function ImprovementChart() {
  const data = FTP_IMPROVEMENT_RATES.map((r) => ({
    name: r.label,
    typicalLow: r.typicalLowPct,
    typicalHigh: r.typicalHighPct,
    topLow: r.topQuartileLowPct,
    topHigh: r.topQuartileHighPct,
    typicalMid: (r.typicalLowPct + r.typicalHighPct) / 2,
    topMid: (r.topQuartileLowPct + r.topQuartileHighPct) / 2,
  }));
  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4 md:p-6">
      <div className="h-72 w-full" aria-label="Realistic FTP improvement after structured training">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: -8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: COLORS.offWhite, fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9A9A9F", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(241,99,99,0.2)" }}
              content={({
                active,
                payload,
                label,
              }: {
                active?: boolean;
                payload?: Array<{ payload: typeof data[0] }>;
                label?: string;
              }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-charcoal/95 border border-white/10 rounded-lg p-3 backdrop-blur-sm shadow-lg">
                    <p className="font-heading text-xs text-coral tracking-widest mb-2">
                      {label?.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Typical:{" "}
                      <span className="text-off-white font-heading">
                        +{p.typicalLow}%-{p.typicalHigh}%
                      </span>
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Top quartile:{" "}
                      <span className="text-coral font-heading">
                        +{p.topLow}%-{p.topHigh}%
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: 8,
                fontSize: 11,
                color: "#B0B0B5",
              }}
            />
            <Line
              type="monotone"
              dataKey="typicalMid"
              name="Typical rider"
              stroke={COLORS.purple}
              strokeWidth={3}
              dot={{ r: 5, fill: COLORS.purple }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="topMid"
              name="Top quartile"
              stroke={COLORS.coral}
              strokeWidth={3}
              dot={{ r: 5, fill: COLORS.coral }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function buildDownload() {
  const payload = {
    report: REPORT_META,
    ftpByAge: FTP_BY_AGE,
    wkgByAge: WKG_BY_AGE,
    trainingHoursByGoal: TRAINING_HOURS_BY_GOAL,
    sportiveTiers: SPORTIVE_TIERS,
    ftpImprovementRates: FTP_IMPROVEMENT_RATES,
  };
  return JSON.stringify(payload, null, 2);
}

export function DownloadShareBar() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([buildDownload()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadman-cycling-benchmarks-2026.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(REPORT_META.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / locked-down contexts — surface as no-op.
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm rounded-md bg-coral text-off-white hover:bg-coral/90 px-5 py-3 transition-colors cursor-pointer"
        data-track="benchmarks_download_json"
      >
        Download dataset (JSON)
      </button>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 font-heading tracking-wider uppercase text-sm rounded-md bg-white/5 text-off-white border border-white/15 hover:bg-white/10 px-5 py-3 transition-colors cursor-pointer"
        data-track="benchmarks_copy_link"
      >
        {copied ? "Link copied" : "Copy share link"}
      </button>
    </div>
  );
}
