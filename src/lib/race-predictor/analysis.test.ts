import { describe, it, expect } from 'vitest';
import {
  normalizedPower,
  variabilityIndex,
  yawHistogram,
  checkpointSplits,
} from './analysis';
import { buildCourse } from './gpx';
import { simulateCourse } from './engine';
import type { RiderProfile, SegmentResult, TrackPoint } from './types';

function fakeSegments(powers: number[], durations: number[]): SegmentResult[] {
  return powers.map((p, i) => ({
    segmentIndex: i,
    startSpeed: 10,
    endSpeed: 10,
    averageSpeed: 10,
    duration: durations[i],
    riderPower: p,
    airDensity: 1.225,
    headwind: 0,
    yawAngle: 0,
  }));
}

describe('normalizedPower', () => {
  it('NP equals AP when power is constant', () => {
    const segs = fakeSegments(Array(60).fill(280), Array(60).fill(30));
    expect(normalizedPower(segs)).toBeCloseTo(280, 0);
  });

  it('NP > AP for variable power', () => {
    const powers: number[] = [];
    for (let i = 0; i < 60; i++) powers.push(i % 2 === 0 ? 380 : 180);
    const np = normalizedPower(fakeSegments(powers, Array(60).fill(30)));
    const ap = powers.reduce((s, p) => s + p, 0) / powers.length;
    expect(np).toBeGreaterThan(ap);
  });

  it('returns 0 on empty input', () => {
    expect(normalizedPower([])).toBe(0);
  });
});

describe('variabilityIndex', () => {
  it('VI = 1 for constant power', () => {
    const segs = fakeSegments(Array(60).fill(280), Array(60).fill(30));
    expect(variabilityIndex(segs)).toBeCloseTo(1.0, 2);
  });

  it('VI > 1 for variable power', () => {
    const powers: number[] = [];
    for (let i = 0; i < 60; i++) powers.push(i % 2 === 0 ? 380 : 180);
    expect(variabilityIndex(fakeSegments(powers, Array(60).fill(30)))).toBeGreaterThan(1.05);
  });
});

describe('yawHistogram', () => {
  it('bins yaws into 5° buckets', () => {
    const segs: SegmentResult[] = [
      { ...fakeSegments([200], [60])[0], yawAngle: 0 },
      { ...fakeSegments([200], [60])[0], yawAngle: Math.PI / 36 }, // 5°
      { ...fakeSegments([200], [60])[0], yawAngle: Math.PI / 18 }, // 10°
      { ...fakeSegments([200], [60])[0], yawAngle: -Math.PI / 36 }, // -5°
    ];
    const hist = yawHistogram(segs, 5);
    const totalTime = hist.reduce((s, b) => s + b.timeS, 0);
    expect(totalTime).toBeCloseTo(240, 0);
    const negBin = hist.find((b) => b.binCenter < 0 && b.binCenter > -10);
    expect(negBin?.timeS).toBe(60);
  });

  it('drive-side ratio = fraction of time with positive yaw', () => {
    const segs: SegmentResult[] = [
      { ...fakeSegments([200], [120])[0], yawAngle: Math.PI / 18 },
      { ...fakeSegments([200], [60])[0], yawAngle: -Math.PI / 18 },
    ];
    const hist = yawHistogram(segs, 5);
    const positive = hist
      .filter((b) => b.binCenter > 0)
      .reduce((s, b) => s + b.timeS, 0);
    const negative = hist
      .filter((b) => b.binCenter < 0)
      .reduce((s, b) => s + b.timeS, 0);
    expect(positive).toBe(120);
    expect(negative).toBe(60);
  });

  it('returns sorted bins', () => {
    const segs: SegmentResult[] = [
      { ...fakeSegments([200], [60])[0], yawAngle: Math.PI / 18 },
      { ...fakeSegments([200], [60])[0], yawAngle: -Math.PI / 36 },
      { ...fakeSegments([200], [60])[0], yawAngle: Math.PI / 36 },
    ];
    const hist = yawHistogram(segs, 5);
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].binCenter).toBeGreaterThan(hist[i - 1].binCenter);
    }
  });
});

describe('checkpointSplits', () => {
  const RIDER: RiderProfile = {
    bodyMass: 72,
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
      p60min: 285,
      durabilityFactor: 0.05,
    },
  };
  const CALM = {
    airTemperature: 15,
    relativeHumidity: 0.5,
    airPressure: 101325,
    windSpeed: 0,
    windDirection: 0,
  };

  function course(segs: { km: number; gradePct: number }[]) {
    const lat = 45;
    const mPerDeg = 111_320 * Math.cos((lat * Math.PI) / 180);
    const points: TrackPoint[] = [];
    let lon = 0;
    let elev = 200;
    const stepM = 50;
    points.push({ lat, lon, elevation: elev });
    for (const s of segs) {
      const n = Math.ceil((s.km * 1000) / stepM);
      for (let i = 0; i < n; i++) {
        lon += stepM / mPerDeg;
        elev += stepM * (s.gradePct / 100);
        points.push({ lat, lon, elevation: elev });
      }
    }
    return buildCourse(points);
  }

  it('produces monotonically increasing distance and cumulative time, ending at the finish', () => {
    const c = course([
      { km: 20, gradePct: 0.5 },
      { km: 8, gradePct: 6 }, // a climb
      { km: 12, gradePct: -3 },
      { km: 20, gradePct: 0.5 },
    ]);
    const result = simulateCourse({
      course: c,
      rider: RIDER,
      environment: CALM,
      pacing: c.segments.map(() => 250),
    });
    const splits = checkpointSplits(c, result);
    expect(splits.length).toBeGreaterThan(2);
    for (let i = 1; i < splits.length; i++) {
      expect(splits[i].distance).toBeGreaterThan(splits[i - 1].distance);
      expect(splits[i].cumulativeTime).toBeGreaterThanOrEqual(
        splits[i - 1].cumulativeTime,
      );
      expect(splits[i].cumulativeElevationGain).toBeGreaterThanOrEqual(
        splits[i - 1].cumulativeElevationGain,
      );
    }
    const last = splits[splits.length - 1];
    expect(last.kind).toBe('finish');
    // Finish cumulative time matches the simulation total within a segment.
    expect(Math.abs(last.cumulativeTime - result.totalTime)).toBeLessThan(30);
  });

  it('flags climb feet and tops, and the climb leg is slower than flat legs', () => {
    const c = course([
      { km: 20, gradePct: 0 },
      { km: 8, gradePct: 7 }, // hard climb
      { km: 20, gradePct: 0 },
    ]);
    const result = simulateCourse({
      course: c,
      rider: RIDER,
      environment: CALM,
      pacing: c.segments.map(() => 280),
    });
    const splits = checkpointSplits(c, result);
    const top = splits.find((s) => s.kind === 'climb_top');
    const foot = splits.find((s) => s.kind === 'climb_start');
    expect(foot).toBeDefined();
    expect(top).toBeDefined();
    // The leg ending at the climb top is slower than the overall finish leg pace.
    expect(top!.legSpeed).toBeLessThan(result.averageSpeed);
  });

  it('returns empty for an empty result', () => {
    const c = course([{ km: 5, gradePct: 0 }]);
    expect(
      checkpointSplits(c, {
        segmentResults: [],
        totalTime: 0,
        totalDistance: 0,
        averageSpeed: 0,
        averagePower: 0,
        normalizedPower: 0,
        variabilityIndex: 1,
      }),
    ).toEqual([]);
  });
});
