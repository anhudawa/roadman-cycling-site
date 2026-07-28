"use client";

import { useEffect } from "react";
import { trackConsentedMetaEvent } from "@/lib/analytics/third-party-tags";

/**
 * Fire a Meta Pixel standard event on mount. Does NOT initialise the
 * pixel or fire PageView — that's handled globally by
 * `ConsentAwarePixel` in the root layout. This component is purely an
 * event emitter for page-specific conversions (Lead on results page,
 * ViewContent on diagnostic pages, etc.).
 *
 * Silently no-ops when fbq isn't loaded (consent denied, ad blocker,
 * or NEXT_PUBLIC_META_PIXEL_ID not set in the global component).
 *
 * Server-side (Conversions API) deduplication isn't wired yet — when
 * Anthony plugs in the CAPI token, make sure server and client events
 * share the same `eventID` per Meta's dedup rules.
 */
export function MetaPixel({
  event,
  eventParams,
}: {
  event?: "Lead" | "CompleteRegistration" | "ViewContent";
  eventParams?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    if (!event) return;
    trackConsentedMetaEvent(event, eventParams);
  }, [event, eventParams]);

  // No markup — init + PageView + noscript fallback all live in
  // ConsentAwarePixel (root layout). This is event-only.
  return null;
}
