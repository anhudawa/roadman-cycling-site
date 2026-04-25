"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-load the recharts impl $— see SparkLine.tsx for rationale.
 */
const DonutChart = dynamic(
  () =>
    import("./DonutChart.impl").then((m) => ({ default: m.DonutChart })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 280 }}
        aria-hidden
        className="animate-pulse rounded-md bg-white/5"
      />
    ),
  },
);

export { DonutChart };
export default DonutChart;
