"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface CostPoint {
  date: string; // YYYY-MM-DD
  cost: number;
}

export function CostTrendChart({ data }: { data: CostPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-md bg-white/5 border border-white/10 p-4 text-xs text-foreground-subtle">
        No cost data yet $€” first cron run will populate this.
      </div>
    );
  }

  const total = data.reduce((sum, p) => sum + p.cost, 0);

  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs text-foreground-subtle uppercase tracking-wide">
          Daily token cost (7d)
        </div>
        <div className="text-xs text-foreground-subtle">
          Total ${total.toFixed(2)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              fontSize: 11,
            }}
            formatter={(value) => [
              typeof value === "number" ? `$${value.toFixed(3)}` : String(value),
              "cost",
            ]}
          />
          <Bar dataKey="cost" fill="#60a5fa" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
