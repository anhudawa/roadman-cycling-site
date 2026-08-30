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
import { DEFAULT_STEP_M, G, MIN_SPEED } from './constants';

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
 * Open-road braking guard for descents. The force model alone predicts terminal
 * velocity; event predictions need the rider behaviour layer too.
 */
function descentSpeedCap(gradePct: number): number {
  // Real riders rarely let long open-road descents run to physics-only
  // terminal velocity. Keep the cap permissive enough for fast alpine roads,
  // but prevent one noisy downhill segment from making a prediction wildly
  // optimistic versus a Best Bike Split-style ride plan with braking limits.
  if (gradePct > -3) return 30; // 108 km/h — effectively uncapped for flat/rolling roads.
  if (gradePct > -6) return 25; // 90 km/h
  if (gradePct > -10) return 22.5; // 81 km/h
  return 20; // 72 km/h on very steep descents.
}

function integrateSegment(args: {
  distance: number;
  startSpeed: number;
  targetPower: number;
  mass: number;
  gradient: number;
  crr: number;
  cda: number;
  airDensity: number;
  headwind: number;
  drivetrainEfficiency: number;
}): { duration: number; endSpeed: number; averageSpeed: number } {
  const gradePct = Math.tan(args.gradient) * 100;
  const maxSpeed = descentSpeedCap(gradePct);
  const sinθ = Math.sin(args.gradient);
  const cosθ = Math.cos(args.gradient);
  const gravForce = args.mass * G * sinθ;
  const rollForce = args.crr * args.mass * G * cosθ;
  const wheelPower = args.targetPower * args.drivetrainEfficiency;

  let remaining = args.distance;
  let v = Math.min(Math.max(args.startSpeed, MIN_SPEED), maxSpeed);
  let duration = 0;

  while (remaining > 0) {
    const dx = Math.min(remaining, DEFAULT_STEP_M);
    const apparent = v + args.headwind;
    const aeroForce =
      0.5 * args.airDensity * args.cda * apparent * Math.abs(apparent);
    const driveForce = wheelPower / Math.max(v, MIN_SPEED);
    const netForce = driveForce - gravForce - rollForce - aeroForce;
    const acceleration = netForce / args.mass;

    let nextSpeedSquared = v * v + 2 * acceleration * dx;
    if (!Number.isFinite(nextSpeedSquared) || nextSpeedSquared < MIN_SPEED * MIN_SPEED) {
      nextSpeedSquared = MIN_SPEED * MIN_SPEED;
    }
    let nextV = Math.sqrt(nextSpeedSquared);
    nextV = Math.min(Math.max(nextV, MIN_SPEED), maxSpeed);

    const avgV = Math.max((v + nextV) / 2, MIN_SPEED);
    duration += dx / avgV;
    v = nextV;
    remaining -= dx;
  }

  return {
    duration,
    endSpeed: v,
    averageSpeed: args.distance / duration,
  };
}

/**
 * Simulate a full course using distance-step integration, preserving momentum
 * between segments instead of snapping every segment to steady-state speed.
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
    const integrated = integrateSegment({
      distance: seg.distance,
      startSpeed: v,
      targetPower,
      mass: totalMass,
      gradient: seg.gradient,
      crr: rider.crr,
      cda: rider.cda,
      airDensity: air.airDensity,
      headwind: air.headwindComponent,
      drivetrainEfficiency: rider.drivetrainEfficiency,
    });
    const yaw = air.yawAngleAt(integrated.averageSpeed);

    results.push({
      segmentIndex: i,
      startSpeed: v,
      endSpeed: integrated.endSpeed,
      averageSpeed: integrated.averageSpeed,
      duration: integrated.duration,
      riderPower: targetPower,
      airDensity: air.airDensity,
      headwind: air.headwindComponent,
      yawAngle: yaw,
    });

    totalTime += integrated.duration;
    totalDistance += seg.distance;
    energySum += targetPower * integrated.duration;
    v = integrated.endSpeed;
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
