import { describe, it, expect } from 'vitest';
import { solveSpeedFromPower, simulateCourse } from './engine';
import { buildCourse } from './gpx';
import type { Environment, RiderProfile, TrackPoint } from './types';

const FLAT_RIDER: RiderProfile = {
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

function flatPoints(stepDeg = 0.001, count = 101): TrackPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    lat: 51.5,
    lon: i * stepDeg,
    elevation: 100,
  }));
}

describe('solveSpeedFromPower', () => {
  it('300W on flat, calm air, GP5000, 80kg, CdA 0.32 → ~38 km/h', () => {
    const v = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const kmh = v * 3.6;
    expect(kmh).toBeGreaterThan(36);
    expect(kmh).toBeLessThan(40);
  });

  it('200W on -5% descent → much faster (terminal speed > 50 km/h)', () => {
    const v = solveSpeedFromPower({
      power: 200,
      mass: 80,
      gradient: Math.atan(-0.05),
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    expect(v * 3.6).toBeGreaterThan(50);
  });

  it('300W on +5% climb (80kg total, 3.75 W/kg) → ~20-23 km/h', () => {
    const v = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: Math.atan(0.05),
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const kmh = v * 3.6;
    expect(kmh).toBeGreaterThan(19);
    expect(kmh).toBeLessThan(24);
  });

  it('200W on +8% climb (80kg, 2.5 W/kg) → ~10-13 km/h', () => {
    const v = solveSpeedFromPower({
      power: 200,
      mass: 80,
      gradient: Math.atan(0.08),
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const kmh = v * 3.6;
    expect(kmh).toBeGreaterThan(9);
    expect(kmh).toBeLessThan(13);
  });

  it('headwind reduces speed monotonically', () => {
    const args = {
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      drivetrainEfficiency: 0.97,
    };
    const v0 = solveSpeedFromPower({ ...args, headwind: 0 });
    const v5 = solveSpeedFromPower({ ...args, headwind: 5 });
    const v10 = solveSpeedFromPower({ ...args, headwind: 10 });
    expect(v0).toBeGreaterThan(v5);
    expect(v5).toBeGreaterThan(v10);
  });

  it('higher mass slows climbing speed (gravity-dominated)', () => {
    const heavy = solveSpeedFromPower({
      power: 300,
      mass: 95,
      gradient: Math.atan(0.08),
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const light = solveSpeedFromPower({
      power: 300,
      mass: 65,
      gradient: Math.atan(0.08),
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    expect(light).toBeGreaterThan(heavy);
  });
});

describe('simulateCourse', () => {
  it('flat ~7km at 280W finishes in 9–13 min at ~38 km/h', () => {
    const course = buildCourse(flatPoints());
    expect(course.totalDistance).toBeGreaterThan(6500);
    expect(course.totalDistance).toBeLessThan(8000);
    const result = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 280),
    });
    const minutes = result.totalTime / 60;
    expect(minutes).toBeGreaterThan(9);
    expect(minutes).toBeLessThan(13);
    expect(result.averageSpeed * 3.6).toBeGreaterThan(35);
    expect(result.averageSpeed * 3.6).toBeLessThan(42);
  });

  it('climbing course is much slower than flat at same power', () => {
    const flat = buildCourse(flatPoints());
    const climbPoints: TrackPoint[] = Array.from({ length: 101 }, (_, i) => ({
      lat: 51.5,
      lon: i * 0.001,
      elevation: 100 + i * 5,
    }));
    const climb = buildCourse(climbPoints);
    const flatResult = simulateCourse({
      course: flat,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: flat.segments.map(() => 280),
    });
    const climbResult = simulateCourse({
      course: climb,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: climb.segments.map(() => 280),
    });
    expect(climbResult.totalTime).toBeGreaterThan(flatResult.totalTime * 2);
  });

  it('headwind adds time on flat course', () => {
    const course = buildCourse(flatPoints());
    const calm = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 280),
    });
    // Course heads ~east. Wind from east (windDirection = π/2) → headwind.
    const windy = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: { ...CALM, windSpeed: 8, windDirection: Math.PI / 2 },
      pacing: course.segments.map(() => 280),
    });
    expect(windy.totalTime).toBeGreaterThan(calm.totalTime);
  });

  it('average power matches pacing plan when constant', () => {
    const course = buildCourse(flatPoints());
    const result = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 250),
    });
    expect(result.averagePower).toBeCloseTo(250, 0);
  });

  it('accepts variable pacing', () => {
    const course = buildCourse(flatPoints());
    const pacing = course.segments.map((_, i) => (i < 50 ? 320 : 240));
    const result = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing,
    });
    expect(result.segmentResults).toHaveLength(course.segments.length);
    expect(result.segmentResults[0].riderPower).toBe(320);
    expect(result.segmentResults[60].riderPower).toBe(240);
  });

  it('throws on pacing length mismatch', () => {
    const course = buildCourse(flatPoints());
    expect(() =>
      simulateCourse({
        course,
        rider: FLAT_RIDER,
        environment: CALM,
        pacing: [100, 200, 300],
      }),
    ).toThrow();
  });
});
