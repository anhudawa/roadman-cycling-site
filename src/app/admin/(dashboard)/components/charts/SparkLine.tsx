"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-load the recharts impl. Recharts is ~100KB gzipped — deferring
 * it keeps initial admin-page JS bundles lean and delays the parse/
 * evaluate cost until the chart actually needs to render.
 *
 * ssr: false because recharts relies on ResizeObserver / measuring DOM,
 * which doesn't work during server render. Admin pages are auth-gated
 * so there's no SEO cost.
 */
const SparkLine = dynamic(
  () => import("./SparkLine.impl").then((m) => ({ default: m.SparkLine })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ width: 80, height: 32 }}
        aria-hidden
        className="opacity-0"
      />
    ),
  },
);

export { SparkLine };
export default SparkLine;
