// Physical constants and preset tables for the race predictor.

import type { RidingPosition, SurfaceType } from './types';

/** Standard gravity, m/s². */
export const G = 9.80665;

/** Specific gas constant for dry air, J/(kg·K). */
export const R_DRY_AIR = 287.058;

/** Specific gas constant for water vapor, J/(kg·K). */
export const R_WATER_VAPOR = 461.495;

/** Standard sea-level air pressure, Pa. */
export const P_SEA_LEVEL = 101325;

/** Standard sea-level temperature, K. */
export const T_SEA_LEVEL = 288.15;

/** Earth radius (Haversine), m. */
export const EARTH_RADIUS = 6_371_000;

/** Default drivetrain efficiency. */
export const DEFAULT_DRIVETRAIN_EFFICIENCY = 0.97;

/** Minimum cycling speed clamped by the engine, m/s. Prevents zero-velocity divergence. */
export const MIN_SPEED = 1.0;

/** Default integration step length, m. */
export const DEFAULT_STEP_M = 10;

/** Acceleration threshold above which the integrator sub-steps, m/s². */
export const SUBSTEP_ACCEL_THRESHOLD = 0.5;

/** CdA presets by riding position, m². */
export const CDA_BY_POSITION: Record<RidingPosition, number> = {
  tt_bars: 0.21,
  aero_drops: 0.24,
  aero_hoods: 0.31,
  endurance_hoods: 0.34,
  standard_hoods: 0.38,
  climbing: 0.40,
};

/** Crr presets by surface. */
export const CRR_BY_SURFACE: Record<SurfaceType, number> = {
  tarmac_smooth: 0.0032,
  tarmac_mixed: 0.0040,
  tarmac_rough: 0.0045,
  chip_seal: 0.0050,
  gravel_smooth: 0.0070,
  gravel_rough: 0.0120,
  cobbles: 0.0250,
};

/** Climb categorisation thresholds. Each entry: {minLength_m, minGradient_rad}. */
export const CLIMB_THRESHOLDS = {
  cat4: { minLength: 250, minGradient: 0.03 },
  cat3: { minLength: 1000, minGradient: 0.04 },
  cat2: { minLength: 3000, minGradient: 0.05 },
  cat1: { minLength: 5000, minGradient: 0.06 },
  hc: { minLength: 10000, minGradient: 0.07 },
} as const;

/** Climb-detection working thresholds (radians for gradient). */
export const CLIMB_DETECT = {
  startGradient: 0.03,
  endGradient: 0.01,
  windowMetres: 100,
  minLength: 250,
} as const;

/** Default Gaussian smoothing sigma (track points). */
export const DEFAULT_SMOOTHING_SIGMA = 4;
