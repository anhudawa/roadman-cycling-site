import { describe, it, expect } from 'vitest';
import { normalizedPower, variabilityIndex, yawHistogram } from './analysis';
import type { SegmentResult } from './types';

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
