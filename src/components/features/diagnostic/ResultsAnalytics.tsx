"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

/**
 * Client-side analytics shim for the results page. Fires a single
 * `diagnostic_results_view` on mount, then installs click handlers
 * on any CTA tagged with `data-cta` so we can attribute conversions
 * back to the rendered variant.
 */
export function ResultsAnalytics({
  slug,
  profile,
}: {
  slug: string;
  profile: string;
}) {
  useEffect(() => {
    trackAnalyticsEvent({
      type: "diagnostic_results_view",
      page: `/diagnostic/${slug}`,
      meta: { profile, slug },
    });
  }, [slug, profile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      trackAnalyticsEvent({
        type: "diagnostic_cta_click",
        page: `/diagnostic/${slug}`,
        meta: { profile, slug, cta: el.dataset.cta ?? "unknown" },
      });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [slug, profile]);

  return null;
}
