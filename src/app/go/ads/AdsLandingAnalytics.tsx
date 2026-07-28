"use client";

import { useEffect } from "react";
import { trackConsentedGoogleEvent } from "@/lib/analytics/third-party-tags";

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

export function AdsLandingAnalytics() {
  useEffect(() => {
    try {
      trackConsentedGoogleEvent(
        "conversion",
        {
          send_to: GADS_CONVERSION_SEND_TO,
          value: 1.0,
          currency: "EUR",
        },
        "marketing",
      );
    } catch {
      // analytics never breaks user flow
    }
  }, []);

  return null;
}
