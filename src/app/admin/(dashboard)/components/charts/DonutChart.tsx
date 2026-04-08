"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { tooltipStyles, chartColors } from "./theme";

const DEFAULT_COLORS = [
  chartColors.coral,
  chartColors.purple,
  chartColors.green,
  chartColors.blue,
  chartColors.amber,
];

interface DonutChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
}

export function DonutChart({ data, colors = DEFAULT_COLORS }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyles.contentStyle}
          labelStyle={tooltipStyles.labelStyle}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", color: "#999" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default DonutChart;
