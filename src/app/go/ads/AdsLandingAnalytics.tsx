"use client";

import { useEffect } from "react";

/**
 * Fires the Google Ads "Ads Landing Page View" conversion once per
 * mount when an ads-sourced visitor lands on /go/ads. Separate from
 * the diagnostic-complete conversion fired in ResultsAnalytics — this
 * one tracks the landing event itself. Mirrors the same dataLayer
 * gtag-stub pattern: GoogleAdsTag loads with strategy="afterInteractive"
 * which can fire after this effect, so we buffer via dataLayer and
 * gtag.js drains the queue on load.
 */

const GADS_CONVERSION_SEND_TO = "AW-18123737652/up0JCJqHxKwcELSUicJD";

interface GtagFn {
  (command: string, action: string, params?: Record<string, unknown>): void;
}

export function AdsLandingAnalytics() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      gtag?: GtagFn;
      dataLayer?: IArguments[];
    };
    try {
      if (typeof w.gtag !== "function") {
        w.dataLayer = w.dataLayer || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        w.gtag = function gtag(...args: any[]) {
          (w.dataLayer as unknown as unknown[][]).push(args);
        } as unknown as GtagFn;
      }
      w.gtag("event", "conversion", {
        send_to: GADS_CONVERSION_SEND_TO,
        value: 1.0,
        currency: "EUR",
      });
    } catch {
      // analytics never breaks user flow
    }
  }, []);

  return null;
}
