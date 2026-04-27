// Server-side AI-referrer detection. Mirrors the client logic in
// `ai-referrer.ts` so that:
//   * events captured via API calls without a browser still get attribution,
//   * adblock-blocked clients that omit `ai_referrer` from the body still
//     produce attributed rows when the Referer header survives.
//
// Same precedence as the client: an explicit `utm_source` on the inbound
// page URL wins, then the `Referer` header hostname is matched.

import { matchAIHost, type AIReferrerHost } from "./ai-referrer";

export interface DetectAIReferrerInput {
  /** The page being tracked (the client passes this in the events POST body). */
  pageUrl: string;
  /** Inbound `Referer` header value, or `null` when absent. */
  referer: string | null;
}

export function detectAIReferrerFromRequest(
  input: DetectAIReferrerInput,
): AIReferrerHost | undefined {
  // 1. utm_source on the page URL wins. URL constructor's second arg lets us
  //    accept both absolute URLs and pathname-only inputs (Tracker sends
  //    `window.location.pathname`).
  try {
    const url = new URL(input.pageUrl, "https://roadmancycling.com");
    const fromUtm = matchAIHost(url.searchParams.get("utm_source"));
    if (fromUtm) return fromUtm;
  } catch {
    // Malformed page URL — fall through to referer.
  }

  if (!input.referer) return undefined;
  try {
    const refUrl = new URL(input.referer);
    return matchAIHost(refUrl.hostname);
  } catch {
    return undefined;
  }
}
