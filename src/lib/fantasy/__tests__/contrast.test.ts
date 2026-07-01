/**
 * Section 8 accessibility requirement: "WCAG AA contrast (coral on
 * charcoal passes; verify coral on purple)". This encodes the check so
 * a future token tweak can't silently break it.
 */

import { describe, it, expect } from "vitest";

const TOKENS = {
  coral: "#F16363",
  charcoal: "#252526",
  deepPurple: "#210140",
  purple: "#4C1273",
  offWhite: "#FAFAFA",
};

function luminance(hex: string): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

describe("brand colour contrast (WCAG AA)", () => {
  it("coral on charcoal passes for normal text", () => {
    expect(ratio(TOKENS.coral, TOKENS.charcoal)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("coral on deep purple passes for normal text (the brief's 'verify' item)", () => {
    expect(ratio(TOKENS.coral, TOKENS.deepPurple)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("coral on brand purple is large-text/UI only — and stays above that bar", () => {
    // 3.4:1 — fine for the Bebas Neue display sizes and UI accents we
    // use it for, below the 4.5 bar for body copy. Body text on purple
    // surfaces must use off-white instead (which is how the components
    // are written).
    const r = ratio(TOKENS.coral, TOKENS.purple);
    expect(r).toBeGreaterThanOrEqual(AA_LARGE);
    expect(r).toBeLessThan(AA_NORMAL);
  });

  it("off-white body text passes on every dark surface", () => {
    for (const surface of [TOKENS.charcoal, TOKENS.deepPurple, TOKENS.purple]) {
      expect(ratio(TOKENS.offWhite, surface)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("charcoal text on coral CTAs passes for the button label sizes", () => {
    expect(ratio(TOKENS.charcoal, TOKENS.coral)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});
