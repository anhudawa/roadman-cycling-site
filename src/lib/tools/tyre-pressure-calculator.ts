export type TyreSurface = "smooth" | "rough" | "gravel";
export type TyreSetup = "tubed" | "tubeless" | "tubular";
export type RimProfile = "hooked" | "hookless" | "unsure";

export interface TyrePressureInput {
  riderWeightKg: number;
  bikeAndGearWeightKg: number;
  measuredTyreWidthMm: number;
  surface: TyreSurface;
  setup: TyreSetup;
  rimProfile: RimProfile;
  systemMinimumPsi?: number;
  systemMaximumPsi?: number;
}

export interface TyrePressureResult {
  frontPsi: number;
  rearPsi: number;
  frontBar: number;
  rearBar: number;
  systemWeightKg: number;
  effectiveMinimumPsi: number | null;
  effectiveMaximumPsi: number | null;
  outsideEnteredLimits: boolean;
  hooklessCeilingApplied: boolean;
}

/**
 * Current ETRTO/ISO-style maximum for a road tubeless straight-side system.
 * Individual tyre/rim combinations can specify a lower maximum, so the UI
 * always instructs riders to use the lowest limit printed by either maker.
 */
export const HOOKLESS_CEILING_PSI = 72;

const MODEL_CONSTANT = 361.6256641967298;
const FRONT_TO_REAR_RATIO = 0.93;
const SURFACE_FACTOR: Record<TyreSurface, number> = {
  smooth: 1,
  rough: 0.9,
  gravel: 0.8,
};

function roundPsi(value: number): number {
  return Math.round(value);
}

function toBar(psi: number): number {
  return Math.round((psi / 14.5038) * 10) / 10;
}

function positiveLimit(value?: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

/**
 * Roadman starting-pressure model, version 1.
 *
 * The rear baseline is a transparent empirical curve:
 *   rear psi = 361.6257 * system kg / measured tyre width^1.8
 *
 * It is normalised so an 83.5 kg road system on a measured 28 mm tyre starts
 * at 75 psi rear on smooth tarmac. The front baseline is 93% of the rear and
 * the surface factors are 1.00 (smooth), 0.90 (rough) and 0.80 (gravel).
 * Setup and rim labels do not secretly change the estimate: casing, tyre/rim
 * pairing and actual axle load vary too much for a universal modifier.
 *
 * This produces a starting estimate, not an engineering approval. It never
 * replaces tyre/rim compatibility tables or their printed pressure range.
 */
export function calculateTyrePressure(
  input: TyrePressureInput,
): TyrePressureResult {
  const systemWeightKg = input.riderWeightKg + input.bikeAndGearWeightKg;
  const surfaceFactor = SURFACE_FACTOR[input.surface];
  const rawRearPsi =
    (MODEL_CONSTANT * systemWeightKg * surfaceFactor) /
    input.measuredTyreWidthMm ** 1.8;
  const rearPsi = roundPsi(rawRearPsi);
  const frontPsi = roundPsi(rawRearPsi * FRONT_TO_REAR_RATIO);

  const enteredMinimum = positiveLimit(input.systemMinimumPsi);
  const enteredMaximum = positiveLimit(input.systemMaximumPsi);
  const hooklessCeiling =
    input.rimProfile === "hookless" ? HOOKLESS_CEILING_PSI : null;
  const effectiveMaximumPsi =
    enteredMaximum !== null && hooklessCeiling !== null
      ? Math.min(enteredMaximum, hooklessCeiling)
      : (enteredMaximum ?? hooklessCeiling);

  const belowMinimum =
    enteredMinimum !== null &&
    (frontPsi < enteredMinimum || rearPsi < enteredMinimum);
  const aboveMaximum =
    effectiveMaximumPsi !== null &&
    (frontPsi > effectiveMaximumPsi || rearPsi > effectiveMaximumPsi);

  return {
    frontPsi,
    rearPsi,
    frontBar: toBar(frontPsi),
    rearBar: toBar(rearPsi),
    systemWeightKg: Math.round(systemWeightKg * 10) / 10,
    effectiveMinimumPsi: enteredMinimum,
    effectiveMaximumPsi,
    outsideEnteredLimits: belowMinimum || aboveMaximum,
    hooklessCeilingApplied:
      hooklessCeiling !== null &&
      (enteredMaximum === null || hooklessCeiling <= enteredMaximum),
  };
}
