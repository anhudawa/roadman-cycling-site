import { describe, it, expect } from 'vitest';
import { quickEstimate, formatDuration, type QuickEstimateInput } from './quick-estimate';

const BASE: QuickEstimateInput = {
  riderMass: 75,
  bikeMass: 8,
  power: 250,
  distanceKm: 100,
  elevationGainM: 1000,
  crr: 0.004,
  cda: 0.31,
};

describe('quickEstimate', () => {
  it('produces a sensible finish time and average speed for a rolling century', () => {
    const r = quickEstimate(BASE);
    // 100 km at ~250 W for an 83 kg system lands in a believable band.
    expect(r.avgSpeedKmh).toBeGreaterThan(25);
    expect(r.avgSpeedKmh).toBeLessThan(40);
    const hours = r.totalTimeSec / 3600;
    expect(hours).toBeGreaterThan(2.5);
    expect(hours).toBeLessThan(4.5);
    expect(r.avgPowerW).toBe(250);
  });

  it('models average climb gradient as 2E/D', () => {
    const r = quickEstimate(BASE);
    // 2 * 1000 / 100000 = 0.02 -> 2%
    expect(r.climbGradientPct).toBeCloseTo(2, 1);
  });

  it('a hillier route of equal distance is slower', () => {
    const flat = quickEstimate({ ...BASE, elevationGainM: 0 });
    const hilly = quickEstimate({ ...BASE, elevationGainM: 2500 });
    expect(hilly.totalTimeSec).toBeGreaterThan(flat.totalTimeSec);
    expect(flat.segments).toHaveLength(1);
    expect(flat.segments[0].label).toBe('Flat');
    expect(hilly.segments).toHaveLength(2);
  });

  it('more power yields a faster time', () => {
    const easy = quickEstimate({ ...BASE, power: 180 });
    const hard = quickEstimate({ ...BASE, power: 320 });
    expect(hard.totalTimeSec).toBeLessThan(easy.totalTimeSec);
  });

  it('a heavier system climbs slower', () => {
    const light = quickEstimate({ ...BASE, riderMass: 60 });
    const heavy = quickEstimate({ ...BASE, riderMass: 95 });
    expect(heavy.totalTimeSec).toBeGreaterThan(light.totalTimeSec);
  });

  it('scales carbohydrate demand with duration', () => {
    const short = quickEstimate({ ...BASE, distanceKm: 25, elevationGainM: 100 });
    const long = quickEstimate({ ...BASE, distanceKm: 200, elevationGainM: 3000 });
    expect(long.nutrition.carbsPerHourG).toBeGreaterThan(short.nutrition.carbsPerHourG);
    expect(long.nutrition.totalCarbsG).toBeGreaterThan(short.nutrition.totalCarbsG);
    expect(long.nutrition.bottles).toBeGreaterThan(short.nutrition.bottles);
  });

  it('recommends a pacing split around the steady number', () => {
    const r = quickEstimate(BASE);
    expect(r.pacing.climbPowerW).toBeGreaterThan(r.pacing.flatPowerW);
    expect(r.pacing.descentPowerW).toBeLessThan(r.pacing.flatPowerW);
  });
});

describe('formatDuration', () => {
  it('formats sub-hour times as M:SS', () => {
    expect(formatDuration(125)).toBe('2:05');
  });
  it('formats multi-hour times as H:MM:SS', () => {
    expect(formatDuration(3 * 3600 + 7 * 60 + 9)).toBe('3:07:09');
  });
});
