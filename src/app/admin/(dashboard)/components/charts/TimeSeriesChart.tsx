"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { tooltipStyles, gridStyles, chartColors } from "./theme";

interface DataKey {
  key: string;
  color: string;
  label: string;
}

interface TimeSeriesChartProps {
  data: { date: string; [key: string]: number | string }[];
  dataKeys: DataKey[];
  height?: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

function formatNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

export function TimeSeriesChart({
  data,
  dataKeys,
  height = 300,
}: TimeSeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          {dataKeys.map((dk) => (
            <linearGradient
              key={dk.key}
              id={`gradient-${dk.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={dk.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray={gridStyles.strokeDasharray}
          stroke={gridStyles.stroke}
          vertical={gridStyles.vertical}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyles.contentStyle}
          labelStyle={tooltipStyles.labelStyle}
          labelFormatter={(label: unknown) => formatDate(String(label))}
          cursor={tooltipStyles.cursor}
        />
        {dataKeys.map((dk) => (
          <Area
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            name={dk.label}
            stroke={dk.color}
            strokeWidth={2}
            fill={`url(#gradient-${dk.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default TimeSeriesChart;
