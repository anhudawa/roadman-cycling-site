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
import {
  G,
  MIN_SPEED,
  DEFAULT_STEP_M,
  SUBSTEP_ACCEL_THRESHOLD,
} from './constants';

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
 *
 * This gives the segment's *terminal* speed. The dynamic integrator in
 * `simulateCourse` uses it as the asymptote each segment relaxes toward; it is
 * also the right answer whenever the rider is already at equilibrium (flat TT).
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
  if (
    !Number.isFinite(power) ||
    !Number.isFinite(mass) ||
    mass <= 0 ||
    !Number.isFinite(cda) ||
    !Number.isFinite(airDensity)
  ) {
    throw new Error('solveSpeedFromPower received non-finite or invalid inputs');
  }
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

  // Bisection: 40 iterations gives precision (60-1)/2^40 ≈ 5.4e-11 m/s.
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    const fMid = residual(mid);
    if (Math.abs(fMid) < 1e-4 || hi - lo < 1e-5) return mid;
    if (fMid < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface SegmentPhysics {
  gravTerm: number;
  rollTerm: number;
  airDensity: number;
  cda: number;
  headwind: number;
  mass: number;
}

/** Net resistive force (N) at speed v on a segment. Sign-aware in apparent wind. */
function resistiveForce(v: number, p: SegmentPhysics): number {
  const apparent = v + p.headwind;
  const aero = 0.5 * p.airDensity * p.cda * apparent * Math.abs(apparent);
  return p.gravTerm + p.rollTerm + aero;
}

/** Longitudinal acceleration (m/s²) for a wheel power applied at speed v. */
function acceleration(v: number, wheelPower: number, p: SegmentPhysics): number {
  const vClamped = Math.max(v, MIN_SPEED);
  const propulsive = wheelPower / vClamped;
  return (propulsive - resistiveForce(vClamped, p)) / p.mass;
}

interface SegmentIntegration {
  endSpeed: number;
  duration: number;
}

/**
 * Integrate the equation of motion across one segment of length L.
 *
 *   m·dv/dt = P_wheel/v − F_resist(v)
 *
 * Worked in the distance domain (dv/dx = a/v) with a midpoint (RK2) step so the
 * rider's kinetic energy is genuinely carried from one segment to the next:
 * speed earned on a descent helps over the next rise; a hard grade transition
 * costs the real acceleration energy instead of being teleported away. Steps
 * default to DEFAULT_STEP_M and subdivide adaptively wherever the instantaneous
 * acceleration exceeds SUBSTEP_ACCEL_THRESHOLD, which is exactly where the
 * coarse step would otherwise lose accuracy (sharp ramps, crests, dive-ins).
 */
function integrateSegment(
  length: number,
  v0: number,
  wheelPower: number,
  p: SegmentPhysics,
): SegmentIntegration {
  if (length <= 0) return { endSpeed: v0, duration: 0 };
  let v = Math.max(v0, MIN_SPEED);
  let x = 0;
  let duration = 0;
  let guard = 0;
  const maxIterations = Math.ceil(length / 0.5) + 64; // hard cap vs runaway loops

  while (x < length - 1e-9 && guard++ < maxIterations) {
    let dx = Math.min(DEFAULT_STEP_M, length - x);
    const a0 = acceleration(v, wheelPower, p);
    // Adaptive subdivision: keep |Δv| over the step small where accel is high.
    if (Math.abs(a0) > SUBSTEP_ACCEL_THRESHOLD) {
      const shrink = (SUBSTEP_ACCEL_THRESHOLD / Math.abs(a0)) * DEFAULT_STEP_M;
      dx = Math.min(dx, Math.max(0.5, shrink));
    }
    // RK2 midpoint in the distance domain: dv/dx = a/v.
    const dvdx0 = a0 / v;
    const vMid = Math.max(v + (dvdx0 * dx) / 2, MIN_SPEED);
    const aMid = acceleration(vMid, wheelPower, p);
    const dvdxMid = aMid / vMid;
    const vNext = Math.max(v + dvdxMid * dx, MIN_SPEED);
    const vAvg = Math.max((v + vNext) / 2, MIN_SPEED);
    duration += dx / vAvg;
    x += dx;
    v = vNext;
  }

  return { endSpeed: v, duration };
}

interface SimulateCourseArgs {
  course: Course;
  rider: RiderProfile;
  environment: Environment;
  pacing: PacingPlan;
  /**
   * Initial speed (m/s). Default is the steady-state speed of the first
   * segment — a flying/rolling start, which is how time-trial and sportive
   * predictions are conventionally reported (a standing-start ramp is a fixed
   * few seconds that nobody attributes to the course).
   */
  initialSpeed?: number;
  /**
   * Enforce the rider's anaerobic battery: if supplied, per-segment power is
   * capped so W'-balance never goes negative. This makes the simulated rider
   * *feasible* — they can never hold a power their physiology can't support,
   * which the bare pacing plan does not guarantee.
   */
  enforceWPrime?: { cp: number; wPrime: number; tau?: number };
}

/**
 * Simulate a full course with time-stepped dynamics. Kinetic energy is carried
 * across segment boundaries by the integrator in `integrateSegment`, so grade
 * and wind transitions cost (or return) real acceleration energy rather than
 * being teleported to steady state.
 */
export function simulateCourse(args: SimulateCourseArgs): CourseResult {
  const { course, rider, environment, pacing } = args;
  if (pacing.length !== course.segments.length) {
    throw new Error(
      `Pacing length ${pacing.length} does not match segments ${course.segments.length}`,
    );
  }
  const totalMass = rider.bodyMass + rider.bikeMass;
  if (!Number.isFinite(totalMass) || totalMass <= 0) {
    throw new Error('Rider + bike mass must be a positive, finite number');
  }

  // W'-balance state (only used when enforceWPrime is supplied).
  const cp = args.enforceWPrime?.cp ?? Infinity;
  const wPrimeMax = args.enforceWPrime?.wPrime ?? Infinity;
  const tau = args.enforceWPrime?.tau ?? 500;
  let wBalance = wPrimeMax;

  // Default initial speed: equilibrium speed of the first segment.
  let v: number;
  if (typeof args.initialSpeed === 'number') {
    v = args.initialSpeed;
  } else if (course.segments.length > 0) {
    const seg0 = course.segments[0];
    const air0 = segmentAirState(environment, {
      roadHeading: seg0.heading,
      altitude: (seg0.startElevation + seg0.endElevation) / 2,
    });
    v = solveSpeedFromPower({
      power: pacing[0],
      mass: totalMass,
      gradient: seg0.gradient,
      crr: rider.crr,
      cda: rider.cda,
      airDensity: air0.airDensity,
      headwind: air0.headwindComponent,
      drivetrainEfficiency: rider.drivetrainEfficiency,
    });
  } else {
    v = MIN_SPEED;
  }

  let totalTime = 0;
  let totalDistance = 0;
  let energySum = 0;
  const results: SegmentResult[] = [];

  for (let i = 0; i < course.segments.length; i++) {
    const seg = course.segments[i];
    let targetPower = pacing[i];
    const altitude = (seg.startElevation + seg.endElevation) / 2;
    const air = segmentAirState(environment, { roadHeading: seg.heading, altitude });

    const physics: SegmentPhysics = {
      gravTerm: totalMass * G * Math.sin(seg.gradient),
      rollTerm: rider.crr * totalMass * G * Math.cos(seg.gradient),
      airDensity: air.airDensity,
      cda: rider.cda,
      headwind: air.headwindComponent,
      mass: totalMass,
    };

    const startSpeed = v;

    // First pass to estimate segment duration for the W'-balance window.
    let integration = integrateSegment(
      seg.distance,
      startSpeed,
      targetPower * rider.drivetrainEfficiency,
      physics,
    );

    // Enforce W'-balance: above CP the battery drains, below CP it recovers
    // (Skiba closed form). If the requested power would overdraw the battery
    // across this segment, cap it to what the remaining balance supports.
    if (Number.isFinite(cp) && Number.isFinite(wPrimeMax)) {
      const dt = integration.duration;
      if (targetPower > cp && dt > 0) {
        const overdraw = (targetPower - cp) * dt;
        if (overdraw > wBalance) {
          // Cap power so this segment exactly empties the remaining balance.
          const feasible = cp + Math.max(0, wBalance) / dt;
          targetPower = Math.min(targetPower, Math.max(cp * 0.5, feasible));
          integration = integrateSegment(
            seg.distance,
            startSpeed,
            targetPower * rider.drivetrainEfficiency,
            physics,
          );
        }
      }
      // Update balance with the (possibly capped) power over the final duration.
      const dtFinal = integration.duration;
      if (targetPower > cp) {
        wBalance = Math.max(0, wBalance - (targetPower - cp) * dtFinal);
      } else {
        wBalance =
          wPrimeMax - (wPrimeMax - wBalance) * Math.exp(-dtFinal / tau);
        if (wBalance > wPrimeMax) wBalance = wPrimeMax;
      }
    }

    const dt = integration.duration;
    const endSpeed = integration.endSpeed;
    const avgSpeed = dt > 0 ? Math.max(seg.distance / dt, MIN_SPEED) : startSpeed;
    const yaw = air.yawAngleAt(avgSpeed);

    results.push({
      segmentIndex: i,
      startSpeed,
      endSpeed,
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
    v = endSpeed;
  }

  const averagePower = totalTime > 0 ? energySum / totalTime : 0;
  return {
    segmentResults: results,
    totalTime,
    totalDistance,
    averageSpeed: totalTime > 0 ? totalDistance / totalTime : 0,
    averagePower,
    normalizedPower: normalizedPower(results),
    variabilityIndex: variabilityIndex(results),
  };
}
