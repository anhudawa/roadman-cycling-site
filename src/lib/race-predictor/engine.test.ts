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

  it('throws on non-finite / zero rider mass (NaN safety at the boundary)', () => {
    const course = buildCourse(flatPoints());
    expect(() =>
      simulateCourse({
        course,
        rider: { ...FLAT_RIDER, bodyMass: 0, bikeMass: 0 },
        environment: CALM,
        pacing: course.segments.map(() => 250),
      }),
    ).toThrow();
    expect(() =>
      simulateCourse({
        course,
        rider: { ...FLAT_RIDER, bodyMass: NaN },
        environment: CALM,
        pacing: course.segments.map(() => 250),
      }),
    ).toThrow();
  });
});

// --- Time-stepped dynamics: kinetic energy is real, not teleported ---------

function gradeCourse(
  segs: { km: number; gradePct: number }[],
  startLat = 45,
  startElevation = 400,
  stepM = 20,
): ReturnType<typeof buildCourse> {
  const mPerDeg = 111_320 * Math.cos((startLat * Math.PI) / 180);
  const points: TrackPoint[] = [];
  let lon = 0;
  let elev = startElevation;
  points.push({ lat: startLat, lon, elevation: elev });
  for (const s of segs) {
    const n = Math.ceil((s.km * 1000) / stepM);
    for (let i = 0; i < n; i++) {
      lon += stepM / mPerDeg;
      elev += stepM * (s.gradePct / 100);
      points.push({ lat: startLat, lon, elevation: elev });
    }
  }
  return buildCourse(points);
}

describe('simulateCourse — dynamics (kinetic energy carry-over)', () => {
  it('a climb entered off a fast descent is quicker than the same climb from equilibrium', () => {
    // KE carry-over: speed earned descending must assist the start of the next
    // rise. A pure steady-state engine cannot show this — both would be equal.
    const climbOnly = gradeCourse([{ km: 2, gradePct: 6 }]);
    const descentThenClimb = gradeCourse([
      { km: 2, gradePct: -6 },
      { km: 2, gradePct: 6 },
    ]);
    const rOnly = simulateCourse({
      course: climbOnly,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: climbOnly.segments.map(() => 280),
    });
    const rDC = simulateCourse({
      course: descentThenClimb,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: descentThenClimb.segments.map(() => 280),
    });
    const half = descentThenClimb.segments.length / 2;
    const climbTimeInDC = rDC.segmentResults
      .slice(half)
      .reduce((s, r) => s + r.duration, 0);
    // Entry speed onto the climb (after the descent) must exceed the climb's
    // own equilibrium speed, and the climb portion must therefore be faster.
    expect(rDC.segmentResults[half].startSpeed).toBeGreaterThan(
      rOnly.segmentResults[0].startSpeed,
    );
    expect(climbTimeInDC).toBeLessThan(rOnly.totalTime);
  });

  it('refining the integration is stable — flat result is grid-independent', () => {
    // The adaptive sub-stepper must converge: doubling the point density on a
    // flat course should not move the time by more than 0.1%.
    const coarse = gradeCourse([{ km: 5, gradePct: 0 }], 45, 100, 50);
    const fine = gradeCourse([{ km: 5, gradePct: 0 }], 45, 100, 10);
    const rc = simulateCourse({
      course: coarse,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: coarse.segments.map(() => 250),
    });
    const rf = simulateCourse({
      course: fine,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: fine.segments.map(() => 250),
    });
    const rel = Math.abs(rc.totalTime - rf.totalTime) / rf.totalTime;
    expect(rel).toBeLessThan(0.001);
  });
});

describe('simulateCourse — W′-balance enforcement', () => {
  it('caps an over-ambitious surge so the modelled rider stays feasible', () => {
    // A heavy surge plan that would overdraw W′. With enforcement on, the
    // delivered average power must drop (the rider physically cannot hold it),
    // so the enforced run is never faster than the unconstrained one.
    const course = gradeCourse([{ km: 6, gradePct: 7 }], 45, 600, 20);
    const surge = course.segments.map(() => 400); // ~well above CP for this rider
    const cp = 300;
    const wPrime = 20_000;
    const unconstrained = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: surge,
    });
    const enforced = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: surge,
      enforceWPrime: { cp, wPrime },
    });
    expect(enforced.averagePower).toBeLessThan(unconstrained.averagePower);
    expect(enforced.totalTime).toBeGreaterThanOrEqual(unconstrained.totalTime);
    // No segment may be left demanding more than the plan once capped.
    for (const seg of enforced.segmentResults) {
      expect(seg.riderPower).toBeLessThanOrEqual(400 + 1e-6);
    }
  });

  it('an along-route weather timeline that builds a headwind slows the prediction', () => {
    // Flat east-bound course. Base: calm. Timeline: wind from the east (π/2)
    // ramps from 0 to 10 m/s over the ride → growing headwind → slower than
    // the no-timeline run, and the second half is slower than the first.
    const course = gradeCourse([{ km: 30, gradePct: 0 }], 45, 100, 50);
    const calm = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 250),
    });
    const windy = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 250),
      weatherTimeline: [
        { atSeconds: 0, windSpeed: 0, windDirection: Math.PI / 2 },
        { atSeconds: 3600, windSpeed: 10, windDirection: Math.PI / 2 },
      ],
    });
    expect(windy.totalTime).toBeGreaterThan(calm.totalTime);
    const half = Math.floor(windy.segmentResults.length / 2);
    const firstHalf = windy.segmentResults.slice(0, half).reduce((s, r) => s + r.duration, 0);
    const secondHalf = windy.segmentResults.slice(half).reduce((s, r) => s + r.duration, 0);
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });

  it('leaves a sub-CP plan untouched (battery only recovers)', () => {
    const course = gradeCourse([{ km: 10, gradePct: 0 }], 45, 100, 50);
    const easy = course.segments.map(() => 200);
    const free = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: easy,
    });
    const enforced = simulateCourse({
      course,
      rider: FLAT_RIDER,
      environment: CALM,
      pacing: easy,
      enforceWPrime: { cp: 280, wPrime: 20_000 },
    });
    expect(enforced.totalTime).toBeCloseTo(free.totalTime, 5);
    expect(enforced.averagePower).toBeCloseTo(200, 5);
  });
});
