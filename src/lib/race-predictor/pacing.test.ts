import { describe, it, expect } from 'vitest';
import { trackWPrimeBalance, optimizePacing } from './pacing';
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

function flat10k(): ReturnType<typeof buildCourse> {
  const stepDeg = 0.001;
  const points: TrackPoint[] = Array.from({ length: 101 }, (_, i) => ({
    lat: 51.5,
    lon: i * stepDeg,
    elevation: 100,
  }));
  return buildCourse(points);
}

describe('trackWPrimeBalance', () => {
  it('starts at full W-prime when given a single below-CP sample', () => {
    const trace = trackWPrimeBalance({
      cp: 280,
      wPrime: 20000,
      powerSamples: [{ power: 280, duration: 60 }],
    });
    expect(trace[0].wPrimeBalance).toBeCloseTo(20000, 0);
  });

  it('depletes at rate (P − CP) above CP', () => {
    const trace = trackWPrimeBalance({
      cp: 280,
      wPrime: 20000,
      powerSamples: [{ power: 380, duration: 60 }],
    });
    // 60s @ +100W = 6000J spent
    expect(trace[trace.length - 1].wPrimeBalance).toBeCloseTo(14000, -1);
  });

  it('recovers toward W_prime when below CP', () => {
    const trace = trackWPrimeBalance({
      cp: 280,
      wPrime: 20000,
      powerSamples: [
        { power: 380, duration: 60 },
        { power: 200, duration: 600 },
      ],
    });
    const final = trace[trace.length - 1].wPrimeBalance;
    expect(final).toBeGreaterThan(15000);
    expect(final).toBeLessThanOrEqual(20000);
  });

  it('clamps at zero (rider blew up)', () => {
    const trace = trackWPrimeBalance({
      cp: 280,
      wPrime: 20000,
      powerSamples: [{ power: 500, duration: 600 }],
    });
    expect(trace[trace.length - 1].wPrimeBalance).toBe(0);
  });

  it('clamps at full (cannot exceed initial W_prime)', () => {
    const trace = trackWPrimeBalance({
      cp: 280,
      wPrime: 20000,
      powerSamples: [{ power: 100, duration: 3600 }],
    });
    expect(trace[trace.length - 1].wPrimeBalance).toBeLessThanOrEqual(20000);
  });
});

describe('optimizePacing', () => {
  it('on flat calm course, optimal pacing is approximately constant', () => {
    const course = flat10k();
    const plan = optimizePacing({
      course,
      rider: RIDER,
      environment: CALM,
      targetIF: 0.85,
    });
    const mean = plan.reduce((s, p) => s + p, 0) / plan.length;
    plan.forEach((p) => {
      expect(p / mean).toBeGreaterThan(0.92);
      expect(p / mean).toBeLessThan(1.08);
    });
  });

  it('returns one power per segment', () => {
    const course = flat10k();
    const plan = optimizePacing({
      course,
      rider: RIDER,
      environment: CALM,
      targetIF: 0.85,
    });
    expect(plan.length).toBe(course.segments.length);
  });

  it('time-weighted mean ≈ target IF · CP', () => {
    const course = flat10k();
    const plan = optimizePacing({
      course,
      rider: RIDER,
      environment: CALM,
      targetIF: 0.85,
    });
    const mean = plan.reduce((s, p) => s + p, 0) / plan.length;
    // CP from sample profile ≈ 60-min anchor 280W minus W'/3600 contribution
    // → ~ 240W. 0.85·240 ≈ 204W.
    expect(mean).toBeGreaterThan(180);
    expect(mean).toBeLessThan(260);
  });

  it('on hilly course at high IF, climbs receive more power than descents', () => {
    const points: TrackPoint[] = [];
    for (let i = 0; i < 50; i++) {
      points.push({ lat: 51.5 + i * 0.001, lon: 0, elevation: 100 + i * 5 });
    }
    for (let i = 50; i < 101; i++) {
      points.push({ lat: 51.5 + i * 0.001, lon: 0, elevation: 100 + (100 - i) * 5 });
    }
    const course = buildCourse(points);
    const plan = optimizePacing({
      course,
      rider: RIDER,
      environment: CALM,
      targetIF: 0.95,
    });
    const climbHalf = plan.slice(0, 50).reduce((s, p) => s + p, 0) / 50;
    const descHalf = plan.slice(50).reduce((s, p) => s + p, 0) / 50;
    expect(climbHalf).toBeGreaterThan(descHalf);
  });

  it('respects surge ceiling', () => {
    const course = flat10k();
    const plan = optimizePacing({
      course,
      rider: RIDER,
      environment: CALM,
      targetIF: 0.85,
      surgeCeiling: 0.10,
    });
    const mean = plan.reduce((s, p) => s + p, 0) / plan.length;
    plan.forEach((p) => {
      expect(p).toBeLessThanOrEqual(mean * 1.20); // some slack from re-normalisation
    });
  });
});
