"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

/**
 * Client-side analytics shim for the results page. Fires a single
 * `diagnostic_results_view` on mount, fires the Google Ads conversion
 * event for "Plateau Diagnostic Complete", then installs click handlers
 * on any CTA tagged with `data-cta` so we can attribute conversions
 * back to the rendered variant.
 */

/** Google Ads conversion label for "Plateau Diagnostic Complete" */
const GADS_CONVERSION_SEND_TO = "AW-18123737652/WDZ_CNiOvKwcELSUicJD";

interface GtagFn {
  (command: string, action: string, params?: Record<string, unknown>): void;
}

function fireGoogleAdsConversion() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: GtagFn };
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("event", "conversion", { send_to: GADS_CONVERSION_SEND_TO });
  } catch {
    // analytics never breaks user flow
  }
}

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

    // Fire Google Ads conversion on first results view
    fireGoogleAdsConversion();
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
