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
 * Solved by Newton-Raphson on the residual f(v) = required_wheel_power − P_rider · η.
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

  // Initial guess
  let v = 8;
  for (let iter = 0; iter < 60; iter++) {
    const apparent = v + headwind;
    const aeroForce = 0.5 * airDensity * cda * apparent * Math.abs(apparent);
    const required = gravTerm * v + rollTerm * v + aeroForce * v;
    const f = required - wheelPower;
    // d(required)/dv = gravTerm + rollTerm + 0.5·ρ·CdA · (3v² + 4v·hw + hw²)
    const df =
      gravTerm +
      rollTerm +
      0.5 * airDensity * cda * (3 * v * v + 4 * v * headwind + headwind * headwind);
    if (Math.abs(df) < 1e-9) break;
    let next = v - f / df;
    if (!Number.isFinite(next)) break;
    // Damp wild swings
    if (Math.abs(next - v) > 20) {
      next = v + Math.sign(next - v) * 5;
    }
    if (Math.abs(next - v) < 1e-5) {
      v = next;
      break;
    }
    v = Math.max(MIN_SPEED, next);
  }
  return v;
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
