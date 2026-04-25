import { describe, it, expect } from 'vitest';
import { fitCpModel, sustainablePower, sustainableDuration } from './rider';
import type { PowerProfile } from './types';

const SAMPLE_PROFILE: PowerProfile = {
  p5s: 1100,
  p1min: 600,
  p5min: 380,
  p20min: 320,
  p60min: 280,
  durabilityFactor: 0.05,
};

describe('fitCpModel', () => {
  it('CP is close to 60-min power', () => {
    const { cp, wPrime } = fitCpModel(SAMPLE_PROFILE);
    expect(cp).toBeGreaterThan(255);
    expect(cp).toBeLessThan(285);
    expect(wPrime).toBeGreaterThan(10000);
    expect(wPrime).toBeLessThan(100000);
  });

  it('20-min power should match the model within 5%', () => {
    const { cp, wPrime } = fitCpModel(SAMPLE_PROFILE);
    const predicted = cp + wPrime / (20 * 60);
    expect(Math.abs(predicted - SAMPLE_PROFILE.p20min) / SAMPLE_PROFILE.p20min).toBeLessThan(
      0.05,
    );
  });

  it('higher 20-min power → larger W-prime', () => {
    const { wPrime: low } = fitCpModel({ ...SAMPLE_PROFILE, p20min: 305 });
    const { wPrime: high } = fitCpModel({ ...SAMPLE_PROFILE, p20min: 340 });
    expect(high).toBeGreaterThan(low);
  });
});

describe('sustainablePower', () => {
  it('returns CP + W/3600 at exactly 1hr', () => {
    const cp = 280;
    const wPrime = 20000;
    const p = sustainablePower({ cp, wPrime, durabilityFactor: 0.05 }, 3600);
    expect(p).toBeCloseTo(cp + wPrime / 3600, 0);
  });

  it('decays past 1hr (durability)', () => {
    const cpModel = { cp: 280, wPrime: 20000, durabilityFactor: 0.05 };
    const at1hr = sustainablePower(cpModel, 3600);
    const at4hr = sustainablePower(cpModel, 4 * 3600);
    expect(at4hr).toBeLessThan(at1hr);
    const drop = (at1hr - at4hr) / at1hr;
    expect(drop).toBeGreaterThan(0.04);
    expect(drop).toBeLessThan(0.15);
  });

  it('stronger durability factor → bigger drop', () => {
    const weak = sustainablePower(
      { cp: 280, wPrime: 20000, durabilityFactor: 0.1 },
      4 * 3600,
    );
    const strong = sustainablePower(
      { cp: 280, wPrime: 20000, durabilityFactor: 0.03 },
      4 * 3600,
    );
    expect(strong).toBeGreaterThan(weak);
  });
});

describe('sustainableDuration', () => {
  it('inverse of P = CP + W/t for short efforts', () => {
    const cpModel = { cp: 280, wPrime: 20000, durabilityFactor: 0.05 };
    const t = sustainableDuration(cpModel, 350);
    // 280 + 20000/t = 350 → t = 20000/70 ≈ 286s
    expect(t).toBeGreaterThan(270);
    expect(t).toBeLessThan(310);
  });

  it('returns Infinity for power at or below CP', () => {
    expect(
      sustainableDuration({ cp: 280, wPrime: 20000, durabilityFactor: 0.05 }, 280),
    ).toBe(Infinity);
  });
});
