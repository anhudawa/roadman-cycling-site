import type { CtaConfig, Profile } from "./types";
import { ctaFor } from "./profiles";

/**
 * Resolves CTA hrefs for the results page. All CTAs now point at
 * static internal paths (the Not Done Yet sales page and a handful
 * of relevant content pieces), so this is a thin wrapper kept for
 * call-site stability — every consumer goes through resolveCta.
 */
export function resolveCta(
  profile: Profile,
  severeMultiSystem: boolean
): CtaConfig {
  return ctaFor(profile, severeMultiSystem);
}

/**
 * Cal.com booking link, retained for any non-diagnostic flow that
 * may still hand a rider to a call. The diagnostic itself no longer
 * routes anyone here — every profile pushes Not Done Yet directly,
 * because call bookings don't scale at the volume the diagnostic
 * funnels in.
 */
export function resolveBookingUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CAL_BOOKING_URL?.trim() ||
    "/contact?topic=plateau-diagnostic"
  );
}
