import { describe, it, expect } from 'vitest';
import {
  composePacingMultiplier,
  runScenarioComparison,
  scalePowerProfileForFtp,
} from './scenarios';
import { buildCourse } from './gpx';
import type { Environment, RiderProfile, TrackPoint } from './types';

const RIDER: RiderProfile = {
  bodyMass: 75,
  bikeMass: 8,
  position: 'aero_hoods',
  cda: 0.32,
  crr: 0.0032,
  drivetrainEfficiency: 0.97,
  powerProfile: {
    p5s: 1100,
    p1min: 600,
    p5min: 380,
    p20min: 320,
    p60min: 280,
    durabilityFactor: 0.05,
  },
};
const CALM: Environment = {
  airTemperature: 15,
  relativeHumidity: 0.5,
  airPressure: 101325,
  windSpeed: 0,
  windDirection: 0,
};

function flat10k() {
  const points: TrackPoint[] = Array.from({ length: 101 }, (_, i) => ({
    lat: 51.5,
    lon: i * 0.001,
    elevation: 100,
  }));
  return buildCourse(points);
}

describe('runScenarioComparison', () => {
  it('lower CdA → faster (negative time delta, positive speed delta)', () => {
    const course = flat10k();
    const pacing = course.segments.map(() => 280);
    const result = runScenarioComparison({
      course,
      rider: RIDER,
      environment: CALM,
      pacing,
      scenarios: [{ name: 'aero', riderPatch: { cda: 0.24 } }],
    });
    expect(result[0].name).toBe('aero');
    expect(result[0].totalTimeDelta).toBeLessThan(0);
    expect(result[0].averageSpeedDelta).toBeGreaterThan(0);
  });

  it('higher mass → slower on a hill', () => {
    const points: TrackPoint[] = Array.from({ length: 101 }, (_, i) => ({
      lat: 51.5 + i * 0.001,
      lon: 0,
      elevation: 100 + i * 10,
    }));
    const course = buildCourse(points);
    const pacing = course.segments.map(() => 280);
    const result = runScenarioComparison({
      course,
      rider: RIDER,
      environment: CALM,
      pacing,
      scenarios: [{ name: '+5kg', riderPatch: { bodyMass: RIDER.bodyMass + 5 } }],
    });
    expect(result[0].totalTimeDelta).toBeGreaterThan(0);
  });

  it('per-segment deltas sum to total delta', () => {
    const course = flat10k();
    const pacing = course.segments.map(() => 280);
    const result = runScenarioComparison({
      course,
      rider: RIDER,
      environment: CALM,
      pacing,
      scenarios: [{ name: 'lower-power', pacingPatch: { multiplier: 280 / 285 } }],
    });
    const sum = result[0].segmentTimeDeltas.reduce((s, d) => s + d, 0);
    expect(sum).toBeCloseTo(result[0].totalTimeDelta, 3);
  });

  it('runs multiple scenarios independently', () => {
    const course = flat10k();
    const pacing = course.segments.map(() => 280);
    const result = runScenarioComparison({
      course,
      rider: RIDER,
      environment: CALM,
      pacing,
      scenarios: [
        { name: 'aero', riderPatch: { cda: 0.24 } },
        { name: 'gp5000', riderPatch: { crr: 0.0028 } },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['aero', 'gp5000']);
    result.forEach((r) => expect(r.totalTimeDelta).toBeLessThan(0));
  });

  it('environment patch (headwind) slows the rider', () => {
    const course = flat10k();
    const pacing = course.segments.map(() => 280);
    const result = runScenarioComparison({
      course,
      rider: RIDER,
      environment: CALM,
      pacing,
      scenarios: [
        {
          name: 'headwind',
          environmentPatch: { windSpeed: 8, windDirection: Math.PI / 2 },
        },
      ],
    });
    expect(result[0].totalTimeDelta).toBeGreaterThan(0);
  });

  it('higher FTP yields a faster predicted time', () => {
    const course = flat10k();
    const baseFtp = RIDER.powerProfile.p60min;
    const ftpDelta = 30;
    const scaled = scalePowerProfileForFtp(RIDER.powerProfile, ftpDelta);
    const multiplier = composePacingMultiplier(
      baseFtp,
      scaled.p60min,
      1,
    );
    const basePacing = course.segments.map(() => baseFtp);
    const result = runScenarioComparison({
      course,
      rider: { ...RIDER, powerProfile: scaled },
      environment: CALM,
      pacing: basePacing.map((p) => p * multiplier),
      scenarios: [{ name: 'baseline-power', pacingPatch: { multiplier: 1 / multiplier } }],
    });
    // The baseline scenario rides at base FTP pacing; the run itself rides the
    // re-anchored (higher) pacing, so the scenario back-off is SLOWER → its
    // delta is positive, i.e. higher FTP is faster than baseline FTP.
    expect(result[0].totalTimeDelta).toBeGreaterThan(0);
  });
});

describe('scalePowerProfileForFtp', () => {
  it('an FTP-only scenario does NOT change p5s/p1min/p5min', () => {
    const scaled = scalePowerProfileForFtp(RIDER.powerProfile, 30);
    expect(scaled.p5s).toBe(RIDER.powerProfile.p5s);
    expect(scaled.p1min).toBe(RIDER.powerProfile.p1min);
    expect(scaled.p5min).toBe(RIDER.powerProfile.p5min);
    expect(scaled.durabilityFactor).toBe(RIDER.powerProfile.durabilityFactor);
  });

  it('moves only the threshold anchors (p20min, p60min) by the FTP delta', () => {
    const scaled = scalePowerProfileForFtp(RIDER.powerProfile, 30);
    expect(scaled.p60min).toBe(RIDER.powerProfile.p60min + 30);
    expect(scaled.p20min).toBe(RIDER.powerProfile.p20min + 30);
  });

  it('floors p60min at 80 W on an extreme negative delta', () => {
    const scaled = scalePowerProfileForFtp(RIDER.powerProfile, -10000);
    expect(scaled.p60min).toBe(80);
    // p20min moves by the *applied* (floored) delta, then is itself floored:
    // 320 + (80 - 280) = 120, which is above the 80 W floor.
    expect(scaled.p20min).toBe(120);
    // unrelated anchors untouched even at the floor
    expect(scaled.p5s).toBe(RIDER.powerProfile.p5s);
  });
});

describe('composePacingMultiplier', () => {
  it('FTP and pacing-slider do not compound multiplicatively', () => {
    const baseFtp = 280;
    const newFtp = 308; // +10% re-anchor
    const slider = 1.1; // +10% bias
    const composed = composePacingMultiplier(baseFtp, newFtp, slider);
    // additive composition: 1.10 + 0.10 = 1.20, NOT the product 1.10*1.10=1.21
    expect(composed).toBeCloseTo(1.2, 10);
    expect(composed).not.toBeCloseTo(1.21, 4);
  });

  it('neutral slider (1.0) is a pure FTP re-anchor', () => {
    expect(composePacingMultiplier(280, 308, 1)).toBeCloseTo(1.1, 10);
  });

  it('unchanged FTP is a pure (clamped) slider', () => {
    expect(composePacingMultiplier(280, 280, 1.1)).toBeCloseTo(1.1, 10);
    // slider is clamped to [0.7, 1.15]
    expect(composePacingMultiplier(280, 280, 5)).toBeCloseTo(1.15, 10);
  });

  it('higher FTP gives a larger pacing multiplier (monotonic)', () => {
    const lo = composePacingMultiplier(280, 290, 1);
    const hi = composePacingMultiplier(280, 320, 1);
    expect(hi).toBeGreaterThan(lo);
  });
});
