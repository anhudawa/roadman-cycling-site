import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveBookingUrl, resolveCta } from "./config";

/**
 * CTA resolution tests. Every profile — including the severe
 * multi-system edge case — now pushes the Not Done Yet sales page.
 * Call bookings were retired here because they don't scale at
 * diagnostic volume; secondaries route to a relevant content piece
 * where one fits.
 */

describe("resolveCta", () => {
  it("routes Under-recovered to the NDY sales page with no secondary", () => {
    const cta = resolveCta("underRecovered", false);
    expect(cta.primaryHref).toBe("/coaching");
    expect(cta.primaryLabel.toLowerCase()).toContain("not done yet");
    expect(cta.secondaryHref).toBe("");
    expect(cta.secondaryLabel).toBe("");
  });

  it("routes Polarisation Failure to the NDY sales page with no secondary", () => {
    const cta = resolveCta("polarisation", false);
    expect(cta.primaryHref).toBe("/coaching");
    expect(cta.primaryLabel.toLowerCase()).toContain("not done yet");
    expect(cta.secondaryHref).toBe("");
  });

  it("routes Strength Gap to NDY with a strength-training secondary", () => {
    const cta = resolveCta("strengthGap", false);
    expect(cta.primaryHref).toBe("/coaching");
    expect(cta.secondaryHref).toBe("/strength-training");
  });

  it("routes Fueling Deficit to NDY with a fuelling-calculator secondary", () => {
    const cta = resolveCta("fuelingDeficit", false);
    expect(cta.primaryHref).toBe("/coaching");
    expect(cta.secondaryHref).toBe("/tools/fuelling");
  });

  it("never produces a CTA whose label mentions a call", () => {
    for (const profile of [
      "underRecovered",
      "polarisation",
      "strengthGap",
      "fuelingDeficit",
    ] as const) {
      for (const severe of [false, true]) {
        const cta = resolveCta(profile, severe);
        expect(cta.primaryLabel.toLowerCase(), `${profile}/${severe}`).not.toContain("call");
        expect(cta.secondaryLabel.toLowerCase(), `${profile}/${severe}`).not.toContain("call");
      }
    }
  });

  it("still routes to NDY when severeMultiSystem is true, regardless of primary", () => {
    for (const profile of [
      "underRecovered",
      "polarisation",
      "strengthGap",
      "fuelingDeficit",
    ] as const) {
      const cta = resolveCta(profile, true);
      expect(cta.primaryHref, profile).toBe("/coaching");
      expect(cta.secondaryHref, profile).toBe("");
    }
  });
});

describe("resolveBookingUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the configured Cal.com URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_CAL_BOOKING_URL", "https://cal.com/anthony/15-min");
    expect(resolveBookingUrl()).toBe("https://cal.com/anthony/15-min");
  });

  it("falls back to /contact when unset so CTAs never 404", () => {
    vi.stubEnv("NEXT_PUBLIC_CAL_BOOKING_URL", "");
    const url = resolveBookingUrl();
    expect(url).toMatch(/^\/contact/);
    expect(url).toContain("topic=plateau-diagnostic");
  });

  it("ignores whitespace-only values", () => {
    vi.stubEnv("NEXT_PUBLIC_CAL_BOOKING_URL", "   ");
    expect(resolveBookingUrl()).toMatch(/^\/contact/);
  });
});
