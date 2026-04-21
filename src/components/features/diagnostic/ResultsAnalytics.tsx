"use client";

import { useEffect } from "react";

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
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "diagnostic_results_view",
        page: `/diagnostic/${slug}`,
        meta: { profile, slug },
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [slug, profile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      const cta = el.dataset.cta ?? "unknown";
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "diagnostic_cta_click",
          page: `/diagnostic/${slug}`,
          meta: { profile, slug, cta },
        }),
        keepalive: true,
      }).catch(() => undefined);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [slug, profile]);

  return null;
}
