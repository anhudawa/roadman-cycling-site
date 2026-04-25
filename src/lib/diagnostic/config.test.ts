import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveBookingUrl, resolveCta } from "./config";

/**
 * CTA resolution tests. Verifies that every profile routes to the
 * right primary / secondary per $§12 and that severeMultiSystem
 * always forces the direct-call variant.
 */

describe("resolveCta", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CAL_BOOKING_URL", "https://cal.com/test/15");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("routes Under-recovered to the direct-call CTA", () => {
    const cta = resolveCta("underRecovered", false);
    expect(cta.primaryHref).toBe("https://cal.com/test/15");
    expect(cta.primaryLabel.toLowerCase()).toContain("call");
    expect(cta.secondaryHref).toBe("/ndy/fit");
  });

  it("routes Fueling Deficit to the direct-call CTA", () => {
    const cta = resolveCta("fuelingDeficit", false);
    expect(cta.primaryHref).toBe("https://cal.com/test/15");
    expect(cta.secondaryHref).toBe("/ndy/fit");
  });

  it("routes Polarisation Failure to NDY", () => {
    const cta = resolveCta("polarisation", false);
    expect(cta.primaryHref).toBe("/ndy/fit");
    expect(cta.primaryLabel.toLowerCase()).toContain("ndy");
    expect(cta.secondaryHref).toBe("https://cal.com/test/15");
  });

  it("routes Strength Gap to NDY with a strength-training secondary", () => {
    const cta = resolveCta("strengthGap", false);
    expect(cta.primaryHref).toBe("/ndy/fit");
    expect(cta.secondaryHref).toBe("/strength-training");
  });

  it("forces a direct-call CTA when severeMultiSystem is true, regardless of primary", () => {
    for (const profile of [
      "underRecovered",
      "polarisation",
      "strengthGap",
      "fuelingDeficit",
    ] as const) {
      const cta = resolveCta(profile, true);
      expect(cta.primaryHref, profile).toBe("https://cal.com/test/15");
      expect(cta.primaryLabel.toLowerCase(), profile).toContain("call");
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
