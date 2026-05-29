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

const CDA_MIN = 0.15;
const CDA_MAX = 0.60;

/**
 * Chung-method residual cost: sum of squared deviations between the
 * virtual-elevation trace and the actual elevation profile over EVERY sample,
 * after removing a constant mean offset.
 *
 * Why whole-ride, not just the endpoint:
 *   The previous objective minimised only |VE_final − actual_final| — a single
 *   point. Two completely different CdA values can land at the same final
 *   altitude (e.g. a VE that bulges high mid-ride then sags back, vs. one that
 *   overlays the real profile the whole way). The endpoint objective scores
 *   them identically and is degenerate / non-convex in practice. The classical
 *   Chung "virtual elevation" criterion instead requires the VE trace to OVERLAY
 *   the real elevation across all laps; the correct CdA is the one that makes
 *   the two profiles coincide everywhere, so we sum squared residuals over the
 *   whole trace. This is sharply minimised at the true CdA and is smooth/convex
 *   enough for golden-section search.
 *
 * Why remove the mean offset (detrend):
 *   `virtualElevation` seeds VE[0] at the first actual elevation, but only the
 *   SHAPE of the VE trace carries CdA information — an absolute altitude bias
 *   (GPS/barometric offset, or simply where we anchor VE[0]) is a nuisance
 *   parameter that should not influence the CdA estimate. We therefore subtract
 *   the mean of (VE − actual) before summing squares, which is the closed-form
 *   least-squares optimal constant offset. (We intentionally do NOT remove a
 *   linear drift: a residual linear drift IS the CdA-error signal in the Chung
 *   method, so detrending it out would erase exactly what we are fitting.)
 */
function chungResidualCost(ride: RidePoint[], args: VEArgs): number {
  const ve = virtualElevation(ride, args);
  // Accumulate residuals (VE − actual) only on samples that carry elevation.
  let sum = 0;
  let n = 0;
  for (let i = 0; i < ride.length; i++) {
    const actual = ride[i].elevation;
    if (actual === undefined) continue;
    sum += ve[i] - actual;
    n++;
  }
  if (n === 0) return Infinity;
  const meanOffset = sum / n;
  let cost = 0;
  for (let i = 0; i < ride.length; i++) {
    const actual = ride[i].elevation;
    if (actual === undefined) continue;
    const r = ve[i] - actual - meanOffset;
    cost += r * r;
  }
  return cost;
}

/**
 * Recover CdA via Chung's virtual-elevation method: find the CdA whose VE trace
 * best overlays the actual elevation profile across the WHOLE ride, minimising
 * the mean-offset-removed sum of squared residuals (see {@link chungResidualCost}).
 *
 * Search strategy (stable & convergent on a bounded bracket):
 *   1. Coarse scan over [0.15, 0.60] in steps of 0.005 to locate the basin.
 *   2. Golden-section refine within a bracket around the coarse minimum,
 *      clamped to the global bounds so the search can never diverge.
 *
 * Best applied to clean rides (constant power preferred, smooth course, no
 * traffic stops). Real-world data needs filtering before this is meaningful —
 * that's a Phase 2 follow-on.
 */
export function estimateCda(ride: RidePoint[], args: EstimateArgs): number {
  if (ride.length < 2) {
    throw new Error('estimateCda requires at least 2 ride points');
  }
  const hasElevation = ride.some((p) => p.elevation !== undefined);
  if (!hasElevation) {
    throw new Error('estimateCda requires elevation on the ride points');
  }

  const cost = (cda: number) => chungResidualCost(ride, { ...args, cda });

  // Coarse scan to find the basin of the global minimum.
  let bestCda = 0.30;
  let bestCost = Infinity;
  for (let cda = CDA_MIN; cda <= CDA_MAX + 1e-9; cda += 0.005) {
    const c = cost(cda);
    if (c < bestCost) {
      bestCost = c;
      bestCda = cda;
    }
  }

  // Golden-section refine in a small bracket around the coarse minimum,
  // clamped to the global bounds so it stays bounded and convergent.
  const phi = (Math.sqrt(5) - 1) / 2;
  let lo = Math.max(CDA_MIN, bestCda - 0.01);
  let hi = Math.min(CDA_MAX, bestCda + 0.01);
  let fc = cost(hi - phi * (hi - lo));
  let fd = cost(lo + phi * (hi - lo));
  for (let i = 0; i < 40 && hi - lo > 1e-5; i++) {
    const c = hi - phi * (hi - lo);
    const d = lo + phi * (hi - lo);
    if (fc < fd) {
      hi = d;
      fd = fc;
      fc = cost(hi - phi * (hi - lo));
    } else {
      lo = c;
      fc = fd;
      fd = cost(lo + phi * (hi - lo));
    }
  }
  return (lo + hi) / 2;
}
