// Air density and wind resolution for the race predictor.

import type { Environment, SegmentAirState } from './types';
import { R_DRY_AIR, R_WATER_VAPOR, P_SEA_LEVEL, G } from './constants';

/**
 * Saturation vapor pressure of water (Tetens equation), Pa.
 * Accurate within ~1% over -30…+50°C.
 */
export function saturationVaporPressure(tempC: number): number {
  return 610.78 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Moist air density via the ideal gas law.
 *   ρ = P_d / (R_d · T) + P_v / (R_v · T)
 * where P_v = RH · e_s(T), P_d = P − P_v.
 */
export function airDensity(env: Environment): number {
  const T = env.airTemperature + 273.15;
  const e_s = saturationVaporPressure(env.airTemperature);
  const e = env.relativeHumidity * e_s;
  const p_d = env.airPressure - e;
  return p_d / (R_DRY_AIR * T) + e / (R_WATER_VAPOR * T);
}

/**
 * Barometric formula assuming ISA lapse rate (-6.5 K/km).
 *   p(h) = P₀ · (1 − L·h / T₀)^(g·M / R·L)
 * with T₀ as sea-level temperature in Kelvin.
 */
export function pressureAtAltitude(altitudeM: number, seaLevelTempC: number): number {
  const L = 0.0065;
  const T_0 = seaLevelTempC + 273.15;
  // exponent = g·M / (R·L) ≈ 5.2558 with M_air = 0.0289644 kg/mol, R = 8.31447 J/(mol·K)
  const exponent = (G * 0.0289644) / (8.31447 * L);
  return P_SEA_LEVEL * Math.pow(1 - (L * altitudeM) / T_0, exponent);
}

/**
 * Resolve wind into headwind/crosswind for a road heading.
 * windDirection is meteorological (0 = wind FROM north → blowing south).
 * roadHeading is geographic (0 = rider heading north).
 *
 * Headwind is positive when wind opposes rider direction.
 * Crosswind is positive when wind hits rider from the right.
 */
export function resolveWind(args: {
  windSpeed: number;
  windDirection: number;
  roadHeading: number;
}): { headwind: number; crosswind: number } {
  const delta = args.windDirection - args.roadHeading;
  return {
    headwind: args.windSpeed * Math.cos(delta),
    crosswind: args.windSpeed * Math.sin(delta),
  };
}

/**
 * Compute the per-segment air state (density + wind components + yaw lookup).
 * If altitude is supplied and > 0, applies barometric pressure and ISA lapse-rate temperature.
 */
export function segmentAirState(
  env: Environment,
  segment: { roadHeading: number; altitude?: number },
): SegmentAirState {
  const altitude = segment.altitude ?? 0;
  const adjustedPressure =
    altitude > 0 ? pressureAtAltitude(altitude, env.airTemperature) : env.airPressure;
  const adjustedTempC =
    altitude > 0 ? env.airTemperature - 0.0065 * altitude : env.airTemperature;
  const rho = airDensity({
    ...env,
    airTemperature: adjustedTempC,
    airPressure: adjustedPressure,
  });
  const { headwind, crosswind } = resolveWind({
    windSpeed: env.windSpeed,
    windDirection: env.windDirection,
    roadHeading: segment.roadHeading,
  });
  return {
    airDensity: rho,
    headwindComponent: headwind,
    crosswindComponent: crosswind,
    yawAngleAt: (riderSpeed: number) => {
      const axial = riderSpeed + headwind;
      if (Math.abs(axial) < 1e-6) return Math.sign(crosswind) * (Math.PI / 2);
      return Math.atan2(crosswind, axial);
    },
  };
}
