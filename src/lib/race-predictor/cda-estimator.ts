// CdA estimation from a ride file via Chung's virtual-elevation method.

import type { RidePoint } from './types';
import { G } from './constants';

interface VEArgs {
  cda: number;
  crr: number;
  mass: number;
  airDensity: number;
  drivetrainEfficiency: number;
}

/**
 * Chung's virtual-elevation method.
 *
 * For each sample compute the gradient required to balance the power equation:
 *   F_grav = P_wheel / v − F_aero − F_roll − F_accel
 *   sin(θ) = F_grav / (m · g)
 * Integrate sin(θ) along distance to recover virtual elevation.
 *
 * Choosing the wrong CdA produces a virtual elevation that drifts away from the
 * actual elevation; Chung's method finds the CdA that minimises that drift.
 */
export function virtualElevation(ride: RidePoint[], args: VEArgs): number[] {
  const ve = new Array<number>(ride.length);
  ve[0] = ride[0].elevation ?? 0;
  for (let i = 1; i < ride.length; i++) {
    const prev = ride[i - 1];
    const cur = ride[i];
    const dt = cur.time - prev.time;
    if (dt <= 0) {
      ve[i] = ve[i - 1];
      continue;
    }
    const v = Math.max(cur.speed, 0.5);
    const dv = cur.speed - prev.speed;
    const F_aero = 0.5 * args.airDensity * args.cda * v * v;
    const F_roll = args.crr * args.mass * G;
    const wheelPower = cur.power * args.drivetrainEfficiency;
    const propulsiveForce = wheelPower / v - F_aero - F_roll;
    const F_accel = args.mass * (dv / dt);
    const F_grav = propulsiveForce - F_accel;
    const sinθ = F_grav / (args.mass * G);
    const dx = v * dt;
    ve[i] = ve[i - 1] + sinθ * dx;
  }
  return ve;
}

interface EstimateArgs {
  crr: number;
  mass: number;
  airDensity: number;
  drivetrainEfficiency: number;
}

/**
 * Recover CdA by minimising |VE_final − actual_final|.
 *
 * 1. Coarse scan from 0.15 to 0.60 in steps of 0.005.
 * 2. Golden-section refine ±0.01 around the coarse minimum.
 *
 * Best applied to clean rides (constant power preferred, smooth course, no traffic stops).
 * Real-world data needs filtering before this is meaningful — that's a Phase 2 follow-on.
 */
export function estimateCda(ride: RidePoint[], args: EstimateArgs): number {
  if (ride.length < 2) {
    throw new Error('estimateCda requires at least 2 ride points');
  }
  const finalActual = ride[ride.length - 1].elevation;
  if (finalActual === undefined) {
    throw new Error('estimateCda requires elevation on the final ride point');
  }

  // Coarse scan
  let bestCda = 0.30;
  let bestErr = Infinity;
  for (let cda = 0.15; cda <= 0.60; cda += 0.005) {
    const ve = virtualElevation(ride, { ...args, cda });
    const err = Math.abs(ve[ve.length - 1] - finalActual);
    if (err < bestErr) {
      bestErr = err;
      bestCda = cda;
    }
  }

  // Golden-section refine ±0.01 around bestCda
  const phi = (Math.sqrt(5) - 1) / 2;
  let lo = bestCda - 0.01;
  let hi = bestCda + 0.01;
  const errAt = (cda: number) => {
    const ve = virtualElevation(ride, { ...args, cda });
    return Math.abs(ve[ve.length - 1] - finalActual);
  };
  for (let i = 0; i < 30; i++) {
    const c = hi - phi * (hi - lo);
    const d = lo + phi * (hi - lo);
    if (errAt(c) < errAt(d)) hi = d;
    else lo = c;
  }
  return (lo + hi) / 2;
}
