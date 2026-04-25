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
