"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-load the recharts impl — see SparkLine.tsx for rationale.
 */
const TimeSeriesChart = dynamic(
  () =>
    import("./TimeSeriesChart.impl").then((m) => ({
      default: m.TimeSeriesChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 300 }}
        aria-hidden
        className="animate-pulse rounded-md bg-white/5"
      />
    ),
  },
);

export { TimeSeriesChart };
export default TimeSeriesChart;
