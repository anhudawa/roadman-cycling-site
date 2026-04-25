import type { CtaConfig, Profile } from "./types";
import { ctaFor } from "./profiles";

/**
 * Resolves CTA hrefs for the results page. The static CTA config uses
 * `{{BOOKING_URL}}` as a placeholder so the profile definitions stay
 * pure $— the actual Cal.com URL is environment-specific and pulled
 * from env here.
 */
export function resolveCta(
  profile: Profile,
  severeMultiSystem: boolean
): CtaConfig {
  const cfg = ctaFor(profile, severeMultiSystem);
  const bookingUrl = resolveBookingUrl();
  return {
    ...cfg,
    primaryHref: cfg.primaryHref.replace("{{BOOKING_URL}}", bookingUrl),
    secondaryHref: cfg.secondaryHref.replace("{{BOOKING_URL}}", bookingUrl),
  };
}

/**
 * Cal.com booking link for Anthony's 15-minute call. Falls back to
 * `/contact` when unconfigured so the CTA never 404s in a dev or
 * preview environment.
 */
export function resolveBookingUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CAL_BOOKING_URL?.trim() ||
    "/contact?topic=plateau-diagnostic"
  );
}
