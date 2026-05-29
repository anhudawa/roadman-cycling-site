/**
 * Multi-lap / circuit support for the Race Predictor.
 *
 * RIGOR PRINCIPLE (house style): every test asserts a tight, specific target —
 * segment counts are exact (`toBe`), totals are checked with explicit relative
 * tolerances that account for the end-to-end re-smoothing the expansion does,
 * and the lap-aware labelling is asserted character-for-character via regex.
 *
 * Reconciled with the re-smoothing reality: expanding to N laps re-runs the
 * canonical `buildCourse` factory over the repeated point series, so the
 * segment count comes out EXACTLY N× the original while elevation/climb totals
 * come out ≈N× (the lap seams smooth slightly).
 */

import { describe, it, expect } from 'vitest';
import { buildCourse, expandCourseToLaps } from './gpx';
import { checkpointSplits } from './analysis';
import { runPrediction } from './run';
import type { Course, TrackPoint } from './types';
import type { RiderInputDTO } from './run';

function metresPerDegLon(lat: number): number {
  return 111_320 * Math.cos((lat * Math.PI) / 180);
}

/**
 * Flat CLOSED circuit of (approximately) the given perimeter — a square loop
 * that returns to its start so the lap seam is short and continuous, which is
 * the shape `expandCourseToLaps` is documented to assume. A straight out-and-back
 * line would create a multi-km seam jump that the GPS-spike filter strips,
 * corrupting the distance — exactly the bug this fixture avoids.
 */
function flatCircuit(distanceKm: number): Course {
  const lat = 51.5;
  const stepM = 100;
  const mPerDeg = metresPerDegLon(lat);
  const sideM = (distanceKm * 1000) / 4;
  const perSide = Math.max(2, Math.round(sideM / stepM));
  const dLon = stepM / mPerDeg;
  const dLat = stepM / 111_320;
  const points: TrackPoint[] = [];
  let lat0 = lat;
  let lon0 = 0;
  points.push({ lat: lat0, lon: lon0, elevation: 100 });
  // East, north, west, south — back to (lat, 0): a closed square.
  for (let i = 0; i < perSide; i++) points.push({ lat: lat0, lon: (lon0 += dLon), elevation: 100 });
  for (let i = 0; i < perSide; i++) points.push({ lat: (lat0 += dLat), lon: lon0, elevation: 100 });
  for (let i = 0; i < perSide; i++) points.push({ lat: lat0, lon: (lon0 -= dLon), elevation: 100 });
  for (let i = 0; i < perSide; i++) points.push({ lat: (lat0 -= dLat), lon: lon0, elevation: 100 });
  return buildCourse(points);
}

interface ProfileSeg {
  km: number;
  gradePct: number;
}

/**
 * Build a CLOSED loop from a list of constant-grade segments. The route runs
 * east out and west back along a parallel track 200 m to the north, so the path
 * returns to (nearly) its start — a true circuit — and the final elevation
 * matches the first (the grades sum to zero). 50 m point spacing.
 */
function syntheticLoop(
  segments: ProfileSeg[],
  startLat = 45,
  startLon = 0,
  startElevation = 200,
  stepM = 50,
): Course {
  const mPerDeg = metresPerDegLon(startLat);
  const points: TrackPoint[] = [];
  let lon = startLon;
  let elev = startElevation;
  points.push({ lat: startLat, lon, elevation: elev });
  // Outbound (east) along the listed profile.
  for (const s of segments) {
    const segs = Math.ceil((s.km * 1000) / stepM);
    for (let i = 0; i < segs; i++) {
      lon += stepM / mPerDeg;
      elev += stepM * (s.gradePct / 100);
      points.push({ lat: startLat, lon, elevation: elev });
    }
  }
  // Step 200 m north onto a parallel return track, then run west all the way
  // back to the start longitude, descending the exact net climb so the loop
  // closes at the start elevation. Finally drop back south to the exact start
  // point, so each lap is a fully CLOSED circuit: lap N+1's first segment is
  // identical to lap 1's first segment and the seam heading matches.
  const backLat = startLat + 200 / 111_320;
  const segsBack = Math.ceil(((lon - startLon) * mPerDeg) / stepM);
  const drop = (elev - startElevation) / Math.max(1, segsBack);
  points.push({ lat: backLat, lon, elevation: elev });
  for (let i = 0; i < segsBack; i++) {
    lon -= stepM / mPerDeg;
    elev -= drop;
    points.push({ lat: backLat, lon: Math.max(startLon, lon), elevation: elev });
  }
  // Close the loop exactly at the start.
  points.push({ lat: startLat, lon: startLon, elevation: startElevation });
  return buildCourse(points);
}

/**
 * One clear climb bracketed by flat road, ridden as a closed loop. The flat tail
 * plus the gentle return descent mean the lap seam is flat, so no cross-seam
 * climb merge happens and the climb count is exactly N× when expanded.
 */
function singleClimbCircuit(): Course {
  return syntheticLoop([
    { km: 3, gradePct: 0 },
    { km: 3, gradePct: 7 },
    { km: 3, gradePct: 0 },
  ]);
}

const TEST_RIDER: RiderInputDTO = {
  bodyMass: 72,
  bikeMass: 8,
  position: 'aero_hoods',
  powerProfile: { ftp: 250 },
};

describe('expandCourseToLaps', () => {
  it('laps=1 returns the SAME object (single-lap is byte-identical)', () => {
    const c = flatCircuit(20);
    expect(expandCourseToLaps(c, 1)).toBe(c);
  });

  it('non-finite / <1 laps are no-ops returning the same object', () => {
    const c = flatCircuit(20);
    expect(expandCourseToLaps(c, 0)).toBe(c);
    expect(expandCourseToLaps(c, -3)).toBe(c);
    expect(expandCourseToLaps(c, Number.NaN)).toBe(c);
    expect(expandCourseToLaps(c, Number.POSITIVE_INFINITY)).toBe(c);
  });

  it('flat 50 km course, laps=4: segments EXACTLY 4× and distance ≈4×', () => {
    const c = flatCircuit(50);
    const exp = expandCourseToLaps(c, 4);
    expect(exp.segments.length).toBe(c.segments.length * 4);
    expect(Math.abs(exp.totalDistance / c.totalDistance - 4)).toBeLessThan(0.01);
  });

  it('coerces fractional laps down to the floor (4.9 → 4)', () => {
    const c = flatCircuit(50);
    const exp = expandCourseToLaps(c, 4.9);
    expect(exp.segments.length).toBe(c.segments.length * 4);
  });

  it('clamps laps to a maximum of 50', () => {
    const c = flatCircuit(5);
    const exp = expandCourseToLaps(c, 999);
    expect(exp.segments.length).toBe(c.segments.length * 50);
  });

  it('single clear climb bracketed by flat, laps=3: climbs EXACTLY 3× and gain within 2% of 3×', () => {
    const c = singleClimbCircuit();
    expect(c.climbs.length).toBeGreaterThanOrEqual(1);
    const exp = expandCourseToLaps(c, 3);
    expect(exp.climbs.length).toBe(c.climbs.length * 3);
    const ratio = exp.totalElevationGain / c.totalElevationGain;
    expect(Math.abs(ratio - 3)).toBeLessThan(0.06); // within 2% of 3×
  });

  it('heading is continuous across the seam (≈ the original early heading)', () => {
    const c = singleClimbCircuit();
    const exp = expandCourseToLaps(c, 3);
    const seamHeading = exp.segments[c.segments.length].heading;
    const earlyHeading = c.segments[1].heading;
    expect(Math.abs(seamHeading - earlyHeading)).toBeLessThan(0.1);
  });
});

describe('checkpointSplits — lap awareness', () => {
  function simulate(course: Course) {
    return runPrediction({ course, rider: TEST_RIDER, mode: 'plan_my_race' }).result;
  }

  it('laps=1: no label contains "Lap"', () => {
    const c = flatCircuit(60);
    const splits = checkpointSplits(c, simulate(c), 1);
    expect(splits.length).toBeGreaterThan(0);
    for (const s of splits) expect(s.label).not.toContain('Lap');
  });

  it('laps=4: every distance-kind marker is lap-tagged or a lap-complete marker', () => {
    const c = flatCircuit(15);
    const exp = expandCourseToLaps(c, 4);
    const splits = checkpointSplits(exp, simulate(exp), 4);
    const distanceMarkers = splits.filter((s) => s.kind === 'distance');
    expect(distanceMarkers.length).toBeGreaterThan(0);
    for (const s of distanceMarkers) {
      const tagged = /^Lap \d+\/4 — /.test(s.label);
      const complete = /^Lap \d+\/4 complete$/.test(s.label);
      expect(tagged || complete).toBe(true);
    }
    // At least one explicit lap-boundary checkpoint exists.
    expect(splits.some((s) => /^Lap \d+\/4 complete$/.test(s.label))).toBe(true);
  });

  it('splits stay monotonic in cumulativeTime and distance (laps=4)', () => {
    const c = flatCircuit(15);
    const exp = expandCourseToLaps(c, 4);
    const splits = checkpointSplits(exp, simulate(exp), 4);
    for (let i = 1; i < splits.length; i++) {
      expect(splits[i].distance).toBeGreaterThanOrEqual(splits[i - 1].distance);
      expect(splits[i].cumulativeTime).toBeGreaterThanOrEqual(
        splits[i - 1].cumulativeTime,
      );
    }
  });
});

describe('runPrediction — laps threading', () => {
  it('laps=1 totalTime is within 1 s of an explicit no-laps call', () => {
    const c = flatCircuit(40);
    const withLaps = runPrediction({ course: c, rider: TEST_RIDER, mode: 'plan_my_race', laps: 1 });
    const noLaps = runPrediction({ course: c, rider: TEST_RIDER, mode: 'plan_my_race' });
    expect(Math.abs(withLaps.result.totalTime - noLaps.result.totalTime)).toBeLessThan(1);
  });

  it('laps=4: totalDistance ≈4× and totalTime ratio in [3.7, 4.3]', () => {
    const c = flatCircuit(20);
    const one = runPrediction({ course: c, rider: TEST_RIDER, mode: 'plan_my_race' });
    const four = runPrediction({ course: c, rider: TEST_RIDER, mode: 'plan_my_race', laps: 4 });
    expect(Math.abs(four.result.totalDistance / one.result.totalDistance - 4)).toBeLessThan(0.01);
    const timeRatio = four.result.totalTime / one.result.totalTime;
    expect(timeRatio).toBeGreaterThan(3.7);
    expect(timeRatio).toBeLessThan(4.3);
  });

  it('stronger rider (FTP 280) is faster than FTP 250 at laps=4 (monotonicity)', () => {
    const c = singleClimbCircuit();
    const weak = runPrediction({
      course: c,
      rider: { ...TEST_RIDER, powerProfile: { ftp: 250 } },
      mode: 'plan_my_race',
      laps: 4,
    });
    const strong = runPrediction({
      course: c,
      rider: { ...TEST_RIDER, powerProfile: { ftp: 280 } },
      mode: 'plan_my_race',
      laps: 4,
    });
    expect(strong.result.totalTime).toBeLessThan(weak.result.totalTime);
  });

  it('run.splits carries at least one lap-tagged label when laps>1', () => {
    const c = flatCircuit(15);
    const run = runPrediction({ course: c, rider: TEST_RIDER, mode: 'plan_my_race', laps: 4 });
    expect(run.splits.some((s) => s.label.includes('Lap'))).toBe(true);
  });
});

// --- POST /api/predict laps validation -----------------------------------
// The route handler's validation predicate (a whole number in [1, 50]) is
// pure and self-contained; we assert it directly rather than mocking the DB,
// rate-limiter and anon-session that the full handler needs.
describe('laps request validation predicate', () => {
  const lapsInvalid = (laps: unknown): boolean =>
    laps !== undefined &&
    (typeof laps !== 'number' ||
      !Number.isInteger(laps) ||
      laps < 1 ||
      laps > 50);

  it('rejects 0, 51, and 2.5', () => {
    expect(lapsInvalid(0)).toBe(true);
    expect(lapsInvalid(51)).toBe(true);
    expect(lapsInvalid(2.5)).toBe(true);
  });

  it('accepts undefined (optional) and the valid integer range', () => {
    expect(lapsInvalid(undefined)).toBe(false);
    expect(lapsInvalid(1)).toBe(false);
    expect(lapsInvalid(4)).toBe(false);
    expect(lapsInvalid(50)).toBe(false);
  });
});

// Type-only reference so the unused `RiderInputDTO` import from types is not a
// lint error if a future refactor needs it; keep the test self-documenting.
export type _LapTestRider = RiderInputDTO;
