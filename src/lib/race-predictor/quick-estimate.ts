// Quick finish-time estimate from aggregate inputs (no GPX profile).
//
// The full predictor (/predict) integrates power-balance over a real
// elevation profile. This module serves the lightweight /tools/race-predictor
// calculator, which only knows total distance and total elevation gain.
//
// Course model — symmetric climb/descent split:
//   With only distance D and total ascent E, we model the route as half
//   climbing and half descending at a single average gradient. For a net-flat
//   loop the descent height equals the climb height, so if both halves share
//   gradient g over distance D/2 each, then (D/2)·g ≈ E ⇒ g = 2E/D. This
//   captures the asymmetry that matters: aero and rolling losses mean climbs
//   cost more time than descents give back, so a hilly route is slower than a
//   flat one of equal distance — which a naive "average gradient = E/D over the
//   whole ride" model gets wrong on loops (it would predict flat-ride speed).
//
// All physics (gravity, rolling resistance, aero drag, drivetrain loss) comes
// from the shared, tested `solveSpeedFromPower` solver.

import { solveSpeedFromPower } from './engine';
import { DEFAULT_DRIVETRAIN_EFFICIENCY } from './constants';

/** Standard sea-level air density, kg/m³. */
export const DEFAULT_AIR_DENSITY = 1.225;

/** Cap modelled average gradient so pathological inputs stay physical. */
const MAX_GRADIENT_FRACTION = 0.15;

/** Realistic descent speed ceiling (m/s ≈ 75 km/h) — riders spin out / brake. */
const DESCENT_SPEED_CAP = 20.8;

export interface QuickEstimateInput {
  /** Rider body mass, kg. */
  riderMass: number;
  /** Bike + kit mass, kg. */
  bikeMass: number;
  /** Average power the rider will hold (or FTP target), W. */
  power: number;
  /** Course distance, km. */
  distanceKm: number;
  /** Total elevation gain, m. */
  elevationGainM: number;
  /** Coefficient of rolling resistance. */
  crr: number;
  /** Aerodynamic drag area CdA, m². */
  cda: number;
  /** Air density, kg/m³. Defaults to sea-level standard. */
  airDensity?: number;
  /** Drivetrain efficiency (0–1). Defaults to 0.97. */
  drivetrainEfficiency?: number;
}

export interface SegmentEstimate {
  label: string;
  distanceKm: number;
  gradientPct: number;
  speedKmh: number;
  timeSec: number;
  powerW: number;
}

export interface PacingPlan {
  climbPowerW: number;
  flatPowerW: number;
  descentPowerW: number;
  note: string;
}

export interface NutritionPlan {
  carbsPerHourG: number;
  totalCarbsG: number;
  fluidPerHourMl: number;
  bottles: number;
  gels: number;
}

export interface QuickEstimateResult {
  /** Public preview figures. */
  totalTimeSec: number;
  avgSpeedKmh: number;
  avgPowerW: number;
  /** Modelled average climb gradient (%). */
  climbGradientPct: number;
  /** Gated detail. */
  segments: SegmentEstimate[];
  pacing: PacingPlan;
  nutrition: NutritionPlan;
}

function mps(speed: number): number {
  return speed * 3.6;
}

/** Compute the finish-time estimate. Pure; safe to call on every keystroke. */
export function quickEstimate(input: QuickEstimateInput): QuickEstimateResult {
  const airDensity = input.airDensity ?? DEFAULT_AIR_DENSITY;
  const drivetrainEfficiency =
    input.drivetrainEfficiency ?? DEFAULT_DRIVETRAIN_EFFICIENCY;
  const mass = input.riderMass + input.bikeMass;
  const distanceM = input.distanceKm * 1000;

  // Symmetric average gradient g = 2E/D, clamped.
  const gradientFraction = Math.min(
    distanceM > 0 ? (2 * input.elevationGainM) / distanceM : 0,
    MAX_GRADIENT_FRACTION,
  );
  const gradientRad = Math.atan(gradientFraction);
  const halfDistanceM = distanceM / 2;

  const solveArgs = {
    power: input.power,
    mass,
    crr: input.crr,
    cda: input.cda,
    airDensity,
    headwind: 0,
    drivetrainEfficiency,
  };

  const climbSpeed = solveSpeedFromPower({ ...solveArgs, gradient: gradientRad });
  const descentSpeed = Math.min(
    solveSpeedFromPower({ ...solveArgs, gradient: -gradientRad }),
    DESCENT_SPEED_CAP,
  );

  const climbTime = halfDistanceM / climbSpeed;
  const descentTime = halfDistanceM / descentSpeed;
  const totalTimeSec = climbTime + descentTime;
  const avgSpeedKmh = totalTimeSec > 0 ? mps(distanceM / totalTimeSec) : 0;
  const gradientPct = gradientFraction * 100;

  const segments: SegmentEstimate[] =
    input.elevationGainM > 0
      ? [
          {
            label: 'Climbing',
            distanceKm: halfDistanceM / 1000,
            gradientPct,
            speedKmh: mps(climbSpeed),
            timeSec: climbTime,
            powerW: input.power,
          },
          {
            label: 'Descending',
            distanceKm: halfDistanceM / 1000,
            gradientPct: -gradientPct,
            speedKmh: mps(descentSpeed),
            timeSec: descentTime,
            powerW: input.power,
          },
        ]
      : [
          {
            label: 'Flat',
            distanceKm: input.distanceKm,
            gradientPct: 0,
            speedKmh: avgSpeedKmh,
            timeSec: totalTimeSec,
            powerW: input.power,
          },
        ];

  return {
    totalTimeSec,
    avgSpeedKmh,
    avgPowerW: input.power,
    climbGradientPct: gradientPct,
    segments,
    pacing: buildPacing(input.power),
    nutrition: buildNutrition(totalTimeSec),
  };
}

function buildPacing(power: number): PacingPlan {
  return {
    climbPowerW: Math.round(power * 1.08),
    flatPowerW: Math.round(power),
    descentPowerW: Math.round(power * 0.85),
    note:
      'Hold your steady number on the flats, lift ~8% on the climbs where speed is bought cheaply, and back off on descents where extra watts buy almost nothing. Same average power, faster finish.',
  };
}

function buildNutrition(totalTimeSec: number): NutritionPlan {
  const hours = totalTimeSec / 3600;
  let carbsPerHourG: number;
  if (hours < 1) carbsPerHourG = 30;
  else if (hours < 1.5) carbsPerHourG = 45;
  else if (hours < 2.5) carbsPerHourG = 60;
  else if (hours < 4) carbsPerHourG = 80;
  else carbsPerHourG = 90;

  const fluidPerHourMl = 600;
  const totalCarbsG = Math.round(carbsPerHourG * hours);
  const totalFluidMl = fluidPerHourMl * hours;

  return {
    carbsPerHourG,
    totalCarbsG,
    fluidPerHourMl,
    bottles: Math.max(1, Math.ceil(totalFluidMl / 550)),
    gels: Math.max(0, Math.round(totalCarbsG / 23)),
  };
}

/** Format seconds as H:MM:SS (or M:SS under an hour). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
