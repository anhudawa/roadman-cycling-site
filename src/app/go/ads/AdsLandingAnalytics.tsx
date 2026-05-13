"use client";

import { useEffect } from "react";

/**
 * Fires the Google Ads "Plateau Diagnostic Complete" conversion when an
 * ads-sourced visitor lands on /go/ads. Mirrors the results-page firing
 * in ResultsAnalytics: stub gtag onto window.dataLayer if the script
 * hasn't initialized yet so the event buffers rather than no-ops.
 */

const GADS_CONVERSION_SEND_TO = "AW-18123737652/WDZ_CNiOvKwcELSUicJD";

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
        value: 10.0,
        currency: "EUR",
      });
    } catch {
      // analytics never breaks user flow
    }
  }, []);

  return null;
}
