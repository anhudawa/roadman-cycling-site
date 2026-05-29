import { describe, it, expect } from 'vitest';
import { virtualElevation, estimateCda } from './cda-estimator';
import type { RidePoint } from './types';
import { G } from './constants';

/**
 * Build a synthetic ride that exactly satisfies the power balance for known CdA, Crr,
 * mass, airDensity and a chosen elevation profile. Each sample computes the rider's
 * speed by integrating accel = (P·η - F_resistive · v) / (m·v).
 */
function syntheticRide(args: {
  cda: number;
  crr: number;
  mass: number;
  airDensity: number;
  power: number;
  durationS: number;
  elevationProfile: (t: number) => number;
}): RidePoint[] {
  const dt = 1;
  const points: RidePoint[] = [];
  let v = 5;
  let prevElev = args.elevationProfile(0);
  points.push({ time: 0, elevation: prevElev, power: args.power, speed: v });
  for (let t = 1; t <= args.durationS; t += dt) {
    const curElev = args.elevationProfile(t);
    const dx = v * dt;
    const sinθ = dx > 1e-6 ? (curElev - prevElev) / dx : 0;
    const F_aero = 0.5 * args.airDensity * args.cda * v * v;
    const F_roll = args.crr * args.mass * G;
    const F_grav = args.mass * G * sinθ;
    const F_resistive = F_aero + F_roll + F_grav;
    const wheelPower = args.power * 0.97;
    const accel = (wheelPower / Math.max(v, 0.5) - F_resistive) / args.mass;
    v = Math.max(0.5, v + accel * dt);
    points.push({ time: t, elevation: curElev, power: args.power, speed: v });
    prevElev = curElev;
  }
  return points;
}

describe('virtualElevation', () => {
  it('integrates back to actual elevation when CdA, Crr known', () => {
    const ride = syntheticRide({
      cda: 0.3,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      power: 250,
      durationS: 600,
      elevationProfile: (t) => 100 + Math.sin(t / 60) * 5,
    });
    const ve = virtualElevation(ride, {
      cda: 0.3,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      drivetrainEfficiency: 0.97,
    });
    const finalActual = ride[ride.length - 1].elevation!;
    const finalVE = ve[ve.length - 1];
    expect(Math.abs(finalVE - finalActual)).toBeLessThan(3);
  });
});

describe('estimateCda', () => {
  it('recovers known CdA from synthetic ride within 5%', () => {
    const trueCda = 0.3;
    const ride = syntheticRide({
      cda: trueCda,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      power: 250,
      durationS: 1200,
      elevationProfile: (t) => 100 + Math.sin(t / 90) * 8,
    });
    const estimated = estimateCda(ride, {
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      drivetrainEfficiency: 0.97,
    });
    expect(Math.abs(estimated - trueCda) / trueCda).toBeLessThan(0.05);
  });

  it('estimated CdA tracks the true CdA across rides (low vs high)', () => {
    const lowCda = 0.24;
    const highCda = 0.4;
    const ride1 = syntheticRide({
      cda: lowCda,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      power: 250,
      durationS: 600,
      elevationProfile: (t) => 100 + Math.sin(t / 60) * 5,
    });
    const ride2 = syntheticRide({
      cda: highCda,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      power: 250,
      durationS: 600,
      elevationProfile: (t) => 100 + Math.sin(t / 60) * 5,
    });
    const estArgs = {
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      drivetrainEfficiency: 0.97,
    };
    const e1 = estimateCda(ride1, estArgs);
    const e2 = estimateCda(ride2, estArgs);
    expect(e2).toBeGreaterThan(e1);
  });

  it('recovers CdA within 3% on a multi-lap ride that returns to start (endpoint-only would be fooled)', () => {
    // Adversarial construction for an endpoint-only objective: the elevation
    // profile is a closed loop — it starts and ENDS at exactly 100 m — so the
    // final-altitude residual carries almost no CdA information (a wide range of
    // CdA values can be coaxed to land back at 100 m). All of the CdA signal
    // lives in the MID-RIDE drift: a wrong CdA makes the VE trace bulge away
    // from the real profile through every lap even though it returns to start.
    // Only the whole-ride Chung residual objective can pin the true CdA here.
    const trueCda = 0.27;
    // Three identical laps of a symmetric climb-then-descend, each returning to
    // the start elevation, so the whole ride is a closed loop.
    const lapPeriod = 200; // s per lap
    const elevationProfile = (t: number) =>
      100 + 6 * Math.sin((2 * Math.PI * t) / lapPeriod);
    const ride = syntheticRide({
      cda: trueCda,
      crr: 0.0035,
      mass: 78,
      airDensity: 1.2,
      power: 240,
      durationS: 3 * lapPeriod, // exactly 3 laps -> ends at start elevation
      elevationProfile,
    });
    // Sanity: the ride really is a closed loop (start ≈ end elevation).
    expect(
      Math.abs(ride[ride.length - 1].elevation! - ride[0].elevation!),
    ).toBeLessThan(0.5);
    const estimated = estimateCda(ride, {
      crr: 0.0035,
      mass: 78,
      airDensity: 1.2,
      drivetrainEfficiency: 0.97,
    });
    expect(Math.abs(estimated - trueCda) / trueCda).toBeLessThan(0.03);
  });

  it('is robust to additive elevation noise (recovers CdA within 5%)', () => {
    // Real barometric/GPS elevation is noisy. The sum-of-squared-residuals
    // objective is a least-squares fit, so zero-mean additive noise should wash
    // out and leave the CdA estimate close to truth. Use a deterministic PRNG
    // so the test is stable.
    const trueCda = 0.31;
    const ride = syntheticRide({
      cda: trueCda,
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      power: 250,
      durationS: 1500,
      elevationProfile: (t) => 100 + Math.sin(t / 80) * 7,
    });
    // Deterministic LCG noise, ±~1.5 m peak, zero-mean.
    let seed = 1337;
    const rand = () => {
      seed = (1103515245 * seed + 12345) & 0x7fffffff;
      return seed / 0x7fffffff - 0.5; // [-0.5, 0.5)
    };
    const noisy = ride.map((p) => ({
      ...p,
      elevation: p.elevation! + rand() * 3,
    }));
    const estimated = estimateCda(noisy, {
      crr: 0.004,
      mass: 80,
      airDensity: 1.225,
      drivetrainEfficiency: 0.97,
    });
    expect(Math.abs(estimated - trueCda) / trueCda).toBeLessThan(0.05);
  });

  it('throws on too-short ride', () => {
    expect(() =>
      estimateCda([{ time: 0, power: 200, speed: 5, elevation: 100 }], {
        crr: 0.004,
        mass: 80,
        airDensity: 1.225,
        drivetrainEfficiency: 0.97,
      }),
    ).toThrow();
  });
});
