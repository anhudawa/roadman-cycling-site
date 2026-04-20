"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-load the recharts impl. See charts/SparkLine.tsx for rationale.
 */
export const CostTrendChart = dynamic(
  () =>
    import("./CostTrendChart.impl").then((m) => ({
      default: m.CostTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 200 }}
        aria-hidden
        className="animate-pulse rounded-md bg-white/5 border border-white/10"
      />
    ),
  },
);

export default CostTrendChart;

// Re-export the CostPoint type from the impl for consumers that need it.
// Next.js type-only re-exports are stripped at build time, so this doesn't
// force the impl into the client bundle.
export type { CostPoint } from "./CostTrendChart.impl";
