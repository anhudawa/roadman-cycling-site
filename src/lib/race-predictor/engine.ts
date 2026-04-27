// Cycling power-balance engine. Pure functions; no I/O.

import type {
  Course,
  CourseResult,
  Environment,
  PacingPlan,
  RiderProfile,
  SegmentResult,
} from './types';
import { segmentAirState } from './environment';
import { normalizedPower, variabilityIndex } from './analysis';
import { G, MIN_SPEED } from './constants';

interface SolveSpeedArgs {
  /** Rider power, W (before drivetrain loss). */
  power: number;
  /** Total mass, kg (rider + bike). */
  mass: number;
  /** Gradient in radians (positive = uphill). */
  gradient: number;
  crr: number;
  cda: number;
  airDensity: number;
  /** m/s, positive = into rider. */
  headwind: number;
  drivetrainEfficiency: number;
}

/**
 * Solve steady-state speed for a given rider power on a single segment.
 *
 * Power balance at the wheel:
 *   P_rider · η = m·g·sin(θ)·v + Crr·m·g·cos(θ)·v + 0.5·ρ·CdA·(v + v_w)²·v
 *
 * Solved by bracketed bisection on the residual f(v) = required − wheelPower.
 *
 * Bisection (vs Newton-Raphson) is robust on steep descents where f(v) has a
 * local minimum at v* = sqrt(-(gravTerm+rollTerm)/(1.5·ρ·CdA)). Below that
 * minimum f' < 0, and Newton-Raphson moves the wrong direction; clamping to
 * MIN_SPEED leaves NR stuck at v=1 m/s indefinitely. Bisection on a fixed
 * bracket [MIN_SPEED, V_HI] always converges in <30 iterations.
 */
export function solveSpeedFromPower(args: SolveSpeedArgs): number {
  const {
    power,
    mass,
    gradient,
    crr,
    cda,
    airDensity,
    headwind,
    drivetrainEfficiency,
  } = args;
  const wheelPower = power * drivetrainEfficiency;
  const sinθ = Math.sin(gradient);
  const cosθ = Math.cos(gradient);
  const gravTerm = mass * G * sinθ;
  const rollTerm = crr * mass * G * cosθ;

  const residual = (v: number): number => {
    const apparent = v + headwind;
    const aeroForce = 0.5 * airDensity * cda * apparent * Math.abs(apparent);
    return gravTerm * v + rollTerm * v + aeroForce * v - wheelPower;
  };

  let lo = MIN_SPEED;
  let hi = 60; // 216 km/h — well above any realistic terminal velocity on a bike
  const fLo = residual(lo);
  if (fLo >= 0) {
    // Rider can't even hold MIN_SPEED at this power on this gradient —
    // a stall on a steep climb. Caller treats MIN_SPEED as a clamp.
    return lo;
  }
  // Extend hi if even 60 m/s isn't enough (pathological inputs); rare.
  let fHi = residual(hi);
  let safety = 0;
  while (fHi < 0 && safety++ < 4) {
    hi *= 2;
    fHi = residual(hi);
  }
  if (fHi < 0) return hi;

  // Bisection: 30 iterations gives precision (60-1)/2^30 ≈ 5.5e-8 m/s.
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    const fMid = residual(mid);
    if (Math.abs(fMid) < 1e-4 || hi - lo < 1e-5) return mid;
    if (fMid < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface SimulateCourseArgs {
  course: Course;
  rider: RiderProfile;
  environment: Environment;
  pacing: PacingPlan;
  /** Initial speed (m/s). Default MIN_SPEED. */
  initialSpeed?: number;
}

/**
 * Simulate a full course. Steady-state speed per segment, with kinetic-energy
 * carry-over between segments via average-of-endpoints integration.
 */
export function simulateCourse(args: SimulateCourseArgs): CourseResult {
  const { course, rider, environment, pacing } = args;
  if (pacing.length !== course.segments.length) {
    throw new Error(
      `Pacing length ${pacing.length} does not match segments ${course.segments.length}`,
    );
  }
  const totalMass = rider.bodyMass + rider.bikeMass;
  let v = args.initialSpeed ?? MIN_SPEED;
  let totalTime = 0;
  let totalDistance = 0;
  let energySum = 0;
  const results: SegmentResult[] = [];

  for (let i = 0; i < course.segments.length; i++) {
    const seg = course.segments[i];
    const targetPower = pacing[i];
    const altitude = (seg.startElevation + seg.endElevation) / 2;
    const air = segmentAirState(environment, { roadHeading: seg.heading, altitude });
    const vSteady = solveSpeedFromPower({
      power: targetPower,
      mass: totalMass,
      gradient: seg.gradient,
      crr: rider.crr,
      cda: rider.cda,
      airDensity: air.airDensity,
      headwind: air.headwindComponent,
      drivetrainEfficiency: rider.drivetrainEfficiency,
    });
    const avgSpeed = Math.max((v + vSteady) / 2, MIN_SPEED);
    const dt = seg.distance / avgSpeed;
    const yaw = air.yawAngleAt(avgSpeed);

    results.push({
      segmentIndex: i,
      startSpeed: v,
      endSpeed: vSteady,
      averageSpeed: avgSpeed,
      duration: dt,
      riderPower: targetPower,
      airDensity: air.airDensity,
      headwind: air.headwindComponent,
      yawAngle: yaw,
    });

    totalTime += dt;
    totalDistance += seg.distance;
    energySum += targetPower * dt;
    v = vSteady;
  }

  const averagePower = totalTime > 0 ? energySum / totalTime : 0;
  return {
    segmentResults: results,
    totalTime,
    totalDistance,
    averageSpeed: totalDistance / totalTime,
    averagePower,
    normalizedPower: normalizedPower(results),
    variabilityIndex: variabilityIndex(results),
  };
}
