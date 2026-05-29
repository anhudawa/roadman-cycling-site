// Air density and wind resolution for the race predictor.

import type {
  Environment,
  SegmentAirState,
  WeatherTimeline,
} from './types';
import { R_DRY_AIR, R_WATER_VAPOR, P_SEA_LEVEL, G } from './constants';

/** Shortest-arc interpolation between two angles (radians), fraction f ∈ [0,1]. */
function lerpAngle(a: number, b: number, f: number): number {
  const twoPi = Math.PI * 2;
  let delta = ((b - a) % twoPi + twoPi) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  const result = a + delta * f;
  return ((result % twoPi) + twoPi) % twoPi;
}

/**
 * Resolve the effective environment at a given elapsed time by interpolating an
 * along-route weather timeline over a base `Environment`. Any field a sample
 * omits falls back to the base value. Numeric fields interpolate linearly;
 * wind direction interpolates along the shortest arc. Before the first sample
 * the earliest is held; after the last, the latest is held (no extrapolation).
 *
 * With no timeline (or an empty one) this returns the base environment
 * unchanged — the engine's default single-condition behaviour.
 */
export function resolveEnvironmentAt(
  base: Environment,
  elapsedSeconds: number,
  timeline?: WeatherTimeline,
): Environment {
  if (!timeline || timeline.length === 0) return base;

  const sorted =
    timeline.length === 1
      ? timeline
      : [...timeline].sort((a, b) => a.atSeconds - b.atSeconds);

  const field = (
    key: 'airTemperature' | 'relativeHumidity' | 'airPressure' | 'windSpeed' | 'windDirection',
    sampleVal: number | undefined,
  ): number => (typeof sampleVal === 'number' ? sampleVal : base[key]);

  // Clamp before first / after last sample.
  if (elapsedSeconds <= sorted[0].atSeconds) {
    const s = sorted[0];
    return {
      airTemperature: field('airTemperature', s.airTemperature),
      relativeHumidity: field('relativeHumidity', s.relativeHumidity),
      airPressure: field('airPressure', s.airPressure),
      windSpeed: field('windSpeed', s.windSpeed),
      windDirection: field('windDirection', s.windDirection),
    };
  }
  const last = sorted[sorted.length - 1];
  if (elapsedSeconds >= last.atSeconds) {
    return {
      airTemperature: field('airTemperature', last.airTemperature),
      relativeHumidity: field('relativeHumidity', last.relativeHumidity),
      airPressure: field('airPressure', last.airPressure),
      windSpeed: field('windSpeed', last.windSpeed),
      windDirection: field('windDirection', last.windDirection),
    };
  }

  // Find the bracketing pair and interpolate.
  let lo = sorted[0];
  let hi = sorted[1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].atSeconds >= elapsedSeconds) {
      hi = sorted[i];
      lo = sorted[i - 1];
      break;
    }
  }
  const span = hi.atSeconds - lo.atSeconds;
  const f = span > 0 ? (elapsedSeconds - lo.atSeconds) / span : 0;
  const lerp = (lv: number, hv: number) => lv + (hv - lv) * f;

  return {
    airTemperature: lerp(field('airTemperature', lo.airTemperature), field('airTemperature', hi.airTemperature)),
    relativeHumidity: lerp(field('relativeHumidity', lo.relativeHumidity), field('relativeHumidity', hi.relativeHumidity)),
    airPressure: lerp(field('airPressure', lo.airPressure), field('airPressure', hi.airPressure)),
    windSpeed: lerp(field('windSpeed', lo.windSpeed), field('windSpeed', hi.windSpeed)),
    windDirection: lerpAngle(field('windDirection', lo.windDirection), field('windDirection', hi.windDirection), f),
  };
}

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
