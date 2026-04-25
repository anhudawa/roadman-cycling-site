"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-load the recharts impl — see SparkLine.tsx for rationale.
 */
const BarChartHorizontal = dynamic(
  () =>
    import("./BarChartHorizontal.impl").then((m) => ({
      default: m.BarChartHorizontal,
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

export { BarChartHorizontal };
export default BarChartHorizontal;
