import { describe, it, expect } from 'vitest';
import { runScenarioComparison } from './scenarios';
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
});
