import { describe, it, expect } from 'vitest';
import {
  recommendTyrePressure,
  crrMultiplierForPressure,
} from './tyre-pressure';
import type { TyrePressureInput } from './tyre-pressure';

const base: TyrePressureInput = {
  systemMassKg: 80,
  tyreWidthMm: 28,
  surface: 'tarmac_smooth',
};

describe('recommendTyrePressure - monotonicity', () => {
  it('heavier rider → higher pressure (both wheels)', () => {
    const light = recommendTyrePressure({ ...base, systemMassKg: 65 });
    const heavy = recommendTyrePressure({ ...base, systemMassKg: 95 });
    expect(heavy.frontPsi).toBeGreaterThan(light.frontPsi);
    expect(heavy.rearPsi).toBeGreaterThan(light.rearPsi);
  });

  it('wider tyre → lower pressure', () => {
    const narrow = recommendTyrePressure({ ...base, tyreWidthMm: 25 });
    const wide = recommendTyrePressure({ ...base, tyreWidthMm: 40 });
    expect(wide.frontPsi).toBeLessThan(narrow.frontPsi);
    expect(wide.rearPsi).toBeLessThan(narrow.rearPsi);
  });

  it('rougher surface → lower pressure than smooth tarmac', () => {
    const smooth = recommendTyrePressure({ ...base, surface: 'tarmac_smooth' });
    const gravel = recommendTyrePressure({ ...base, surface: 'gravel_rough' });
    const cobbles = recommendTyrePressure({ ...base, surface: 'cobbles' });
    expect(gravel.rearPsi).toBeLessThan(smooth.rearPsi);
    expect(cobbles.rearPsi).toBeLessThan(gravel.rearPsi);
    expect(cobbles.frontPsi).toBeLessThan(smooth.frontPsi);
  });

  it('rear pressure ≥ front pressure at default 52% rear split', () => {
    const rec = recommendTyrePressure(base);
    expect(rec.rearPsi).toBeGreaterThanOrEqual(rec.frontPsi);
  });

  it('explicit higher rear split widens the rear/front gap', () => {
    const even = recommendTyrePressure({ ...base, frontRearSplitPct: 0.5 });
    const rearBiased = recommendTyrePressure({ ...base, frontRearSplitPct: 0.6 });
    expect(even.rearPsi - even.frontPsi).toBeLessThan(
      rearBiased.rearPsi - rearBiased.frontPsi,
    );
  });
});

describe('recommendTyrePressure - bounds & sanity', () => {
  it('never recommends below 15 psi or above 120 psi', () => {
    const extremeHeavyNarrow = recommendTyrePressure({
      systemMassKg: 200,
      tyreWidthMm: 23,
      surface: 'tarmac_smooth',
    });
    const extremeLightWide = recommendTyrePressure({
      systemMassKg: 40,
      tyreWidthMm: 55,
      surface: 'cobbles',
    });
    for (const r of [extremeHeavyNarrow, extremeLightWide]) {
      expect(r.frontPsi).toBeGreaterThanOrEqual(15);
      expect(r.rearPsi).toBeGreaterThanOrEqual(15);
      expect(r.frontPsi).toBeLessThanOrEqual(120);
      expect(r.rearPsi).toBeLessThanOrEqual(120);
    }
  });

  it('respects narrower per-width bounds for a 25 mm road tyre', () => {
    const r = recommendTyrePressure({
      systemMassKg: 90,
      tyreWidthMm: 25,
      surface: 'tarmac_smooth',
    });
    // 25 mm window interpolates inside [55..75]/[90..110]; never beyond 23 mm cap.
    expect(r.rearPsi).toBeLessThanOrEqual(110);
    expect(r.rearPsi).toBeGreaterThanOrEqual(55);
  });

  it('a 45 mm gravel tyre lives in a far lower window than a 25 mm road tyre', () => {
    const road = recommendTyrePressure({
      systemMassKg: 80,
      tyreWidthMm: 25,
      surface: 'tarmac_smooth',
    });
    const gravel = recommendTyrePressure({
      systemMassKg: 80,
      tyreWidthMm: 45,
      surface: 'gravel_smooth',
    });
    expect(gravel.rearPsi).toBeLessThan(road.rearPsi);
    expect(gravel.rearPsi).toBeLessThan(55);
  });

  it('bar conversion is consistent with psi', () => {
    const r = recommendTyrePressure(base);
    expect(r.frontBar).toBeCloseTo(r.frontPsi * 0.0689476, 1);
    expect(r.rearBar).toBeCloseTo(r.rearPsi * 0.0689476, 1);
  });

  it('rationale is a non-empty string mentioning the surface', () => {
    const r = recommendTyrePressure({ ...base, surface: 'cobbles' });
    expect(typeof r.rationale).toBe('string');
    expect(r.rationale.length).toBeGreaterThan(0);
    expect(r.rationale).toContain('cobbles');
  });
});

describe('recommendTyrePressure - degenerate inputs', () => {
  it('zero / negative mass falls back without NaN', () => {
    for (const m of [0, -50, NaN, Infinity]) {
      const r = recommendTyrePressure({ ...base, systemMassKg: m });
      expect(Number.isFinite(r.frontPsi)).toBe(true);
      expect(Number.isFinite(r.rearPsi)).toBe(true);
      expect(r.frontPsi).toBeGreaterThanOrEqual(15);
    }
  });

  it('zero / negative width falls back without NaN', () => {
    for (const w of [0, -10, NaN]) {
      const r = recommendTyrePressure({ ...base, tyreWidthMm: w });
      expect(Number.isFinite(r.frontPsi)).toBe(true);
      expect(Number.isFinite(r.rearPsi)).toBe(true);
    }
  });

  it('out-of-range split is clamped (never inverts or starves a wheel)', () => {
    const r = recommendTyrePressure({ ...base, frontRearSplitPct: 5 });
    expect(r.rearPsi).toBeGreaterThanOrEqual(r.frontPsi);
    expect(Number.isFinite(r.frontPsi)).toBe(true);
  });
});

describe('crrMultiplierForPressure', () => {
  it('at recommended pressure the multiplier is ~1', () => {
    const m = crrMultiplierForPressure({
      actualPsi: 60,
      recommendedPsi: 60,
      surface: 'tarmac_smooth',
    });
    expect(m).toBeGreaterThan(0.99);
    expect(m).toBeLessThanOrEqual(1.0);
  });

  it('over-inflation on cobbles → multiplier > 1', () => {
    const m = crrMultiplierForPressure({
      actualPsi: 90,
      recommendedPsi: 45,
      surface: 'cobbles',
    });
    expect(m).toBeGreaterThan(1);
  });

  it('over-inflation penalty is larger on cobbles than on smooth tarmac', () => {
    const smooth = crrMultiplierForPressure({
      actualPsi: 90,
      recommendedPsi: 60,
      surface: 'tarmac_smooth',
    });
    const cobbles = crrMultiplierForPressure({
      actualPsi: 90,
      recommendedPsi: 60,
      surface: 'cobbles',
    });
    expect(cobbles).toBeGreaterThan(smooth);
    expect(smooth).toBeGreaterThan(1);
  });

  it('slightly under recommended on rough ground → multiplier < 1 (faster)', () => {
    const m = crrMultiplierForPressure({
      actualPsi: 40, // ~11% under 45
      recommendedPsi: 45,
      surface: 'gravel_rough',
    });
    expect(m).toBeLessThan(1);
  });

  it('multiplier always bounded to [0.95, 1.15]', () => {
    const cases = [
      { actualPsi: 1, recommendedPsi: 100, surface: 'cobbles' as const },
      { actualPsi: 300, recommendedPsi: 30, surface: 'cobbles' as const },
      { actualPsi: 120, recommendedPsi: 20, surface: 'gravel_rough' as const },
      { actualPsi: 60, recommendedPsi: 60, surface: 'tarmac_smooth' as const },
    ];
    for (const c of cases) {
      const m = crrMultiplierForPressure(c);
      expect(m).toBeGreaterThanOrEqual(0.95);
      expect(m).toBeLessThanOrEqual(1.15);
    }
  });

  it('degenerate inputs never produce NaN', () => {
    for (const c of [
      { actualPsi: 0, recommendedPsi: 0, surface: 'cobbles' as const },
      { actualPsi: NaN, recommendedPsi: 50, surface: 'gravel_smooth' as const },
      { actualPsi: 50, recommendedPsi: -10, surface: 'tarmac_smooth' as const },
    ]) {
      const m = crrMultiplierForPressure(c);
      expect(Number.isFinite(m)).toBe(true);
    }
  });
});
