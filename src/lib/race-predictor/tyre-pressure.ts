// Evidence-based tyre-pressure recommender + rolling-resistance (Crr) adjustment.
//
// Background / citations (citation-style notes, not exhaustive):
//   - Silca "Tyre Pressure as Suspension" (Josh Poertner) and the broader
//     "impedance" / "breakpoint pressure" body of work. The core finding from
//     roller + real-world testing (e.g. Silca, bicyclerollingresistance.com,
//     Jan Heine / Rene Herse "Bicycle Quarterly" tests) is that on smooth steel
//     drums Crr falls monotonically with pressure, but on real (rough) roads
//     there is a *breakpoint pressure* above which total rolling resistance
//     RISES again. Above the breakpoint the tyre stops absorbing road texture
//     and instead the whole bike+rider system is forced to move vertically and
//     vibrate — "impedance" / suspension losses — which dominate the small
//     hysteresis saving. Rougher surfaces push the breakpoint to LOWER pressures.
//   - Practical fitters (SRAM/Zipp, ENVE, Silca pressure calculators) all model
//     recommended pressure as: rising with system mass, FALLING with tyre width
//     (larger air volume needs less pressure for the same contact-patch / casing
//     tension), and LOWER on rough/gravel/cobbled surfaces.
//
// This module is a deliberately simple, *defensible* analytic surrogate for those
// calculators. It is pure, deterministic, and clamped to physically sane ranges.
// It is NOT a substitute for the tyre manufacturer's printed max pressure.

import type { SurfaceType } from './types';

/** Convert psi to bar. */
const PSI_TO_BAR = 0.0689476;

export interface TyrePressureInput {
  /** Total system mass: rider + bike + kit + bottles, kg. */
  systemMassKg: number;
  /** Tyre width, mm (the measured/inflated width if known). */
  tyreWidthMm: number;
  /** Surface the recommendation targets. */
  surface: SurfaceType;
  /**
   * Fraction of total load carried by the rear wheel, 0-1. Most riders sit
   * roughly 52-55% on the rear; default 0.52. Front gets (1 - this).
   */
  frontRearSplitPct?: number;
}

export interface TyrePressureRecommendation {
  frontPsi: number;
  rearPsi: number;
  frontBar: number;
  rearBar: number;
  rationale: string;
}

/**
 * Surface roughness factor. Multiplies the baseline pressure: rougher ground
 * lowers the breakpoint pressure, so we recommend lower pressure. Tarmac-smooth
 * is the 1.0 reference. These track the qualitative spacing of CRR_BY_SURFACE
 * in constants.ts (smooth tarmac → cobbles) but express the *pressure* response,
 * which is the inverse direction to Crr at fixed pressure.
 */
const SURFACE_PRESSURE_FACTOR: Record<SurfaceType, number> = {
  tarmac_smooth: 1.0,
  tarmac_mixed: 0.95,
  tarmac_rough: 0.9,
  chip_seal: 0.85,
  gravel_smooth: 0.72,
  gravel_rough: 0.6,
  cobbles: 0.5,
};

/**
 * Per-width sane pressure bounds, psi. A narrow 23-25 mm road tyre tolerates and
 * needs far higher pressure than a wide 45 mm gravel tyre. Bounds interpolate
 * between these anchors by width and are also hard-clamped to the global
 * [GLOBAL_MIN_PSI, GLOBAL_MAX_PSI].
 *
 * Anchors are conservative real-world envelopes (approx). The MIN is set low
 * enough that a rough-surface setup (Paris-Roubaix-style 28-30 mm at ~45 psi,
 * or a soft gravel tyre) can actually reach its recommended pressure rather than
 * being pinned at a road-oriented floor — otherwise the surface term would be
 * clamped away on the very surfaces it matters most:
 *   23 mm: 60-110 psi   28 mm: 42-90 psi   32 mm: 35-75 psi
 *   40 mm: 24-55 psi    50 mm: 18-40 psi
 */
interface WidthAnchor {
  widthMm: number;
  minPsi: number;
  maxPsi: number;
}
const WIDTH_ANCHORS: WidthAnchor[] = [
  { widthMm: 23, minPsi: 60, maxPsi: 110 },
  { widthMm: 28, minPsi: 42, maxPsi: 90 },
  { widthMm: 32, minPsi: 35, maxPsi: 75 },
  { widthMm: 40, minPsi: 24, maxPsi: 55 },
  { widthMm: 50, minPsi: 18, maxPsi: 40 },
];

/** Global hard safety clamp, psi. Nothing ever escapes this range. */
const GLOBAL_MIN_PSI = 15;
const GLOBAL_MAX_PSI = 120;

/** Reference system mass (kg) that anchors the pressure curve. */
const REFERENCE_MASS_KG = 80;
/** Reference tyre width (mm) that anchors the pressure curve. */
const REFERENCE_WIDTH_MM = 28;
/** Baseline pressure (psi) at reference mass, reference width, smooth tarmac. */
const BASE_PSI = 70;

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

/** Sanitize a positive finite number, falling back to a default. */
function safePositive(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

/**
 * Linearly interpolate the [min,max] psi bounds for an arbitrary width using
 * WIDTH_ANCHORS, with flat extrapolation (clamped) beyond the end anchors.
 */
function widthBounds(widthMm: number): { minPsi: number; maxPsi: number } {
  const anchors = WIDTH_ANCHORS;
  if (widthMm <= anchors[0].widthMm) {
    return { minPsi: anchors[0].minPsi, maxPsi: anchors[0].maxPsi };
  }
  const last = anchors[anchors.length - 1];
  if (widthMm >= last.widthMm) {
    return { minPsi: last.minPsi, maxPsi: last.maxPsi };
  }
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (widthMm >= a.widthMm && widthMm <= b.widthMm) {
      const t = (widthMm - a.widthMm) / (b.widthMm - a.widthMm);
      return {
        minPsi: a.minPsi + t * (b.minPsi - a.minPsi),
        maxPsi: a.maxPsi + t * (b.maxPsi - a.maxPsi),
      };
    }
  }
  // Unreachable given the guards above, but keep TS + runtime safe.
  return { minPsi: last.minPsi, maxPsi: last.maxPsi };
}

/**
 * Core unclamped pressure model for a single wheel, psi.
 *
 * pressure = BASE_PSI
 *          × (load / referenceLoad)               // rises with mass on that wheel
 *          × (referenceWidth / width)             // FALLS with wider tyre (more volume)
 *          × surfaceFactor                         // LOWER on rough ground
 *
 * The mass and width terms are the classic "tension/volume" scaling used by
 * pressure calculators: required casing tension scales with load and inversely
 * with the air volume (≈ width). We use linear-in-load and inverse-in-width,
 * which matches the monotonic behaviour the house tests assert and stays close
 * to published calculators across the everyday 60-100 kg / 23-50 mm envelope.
 */
function modelWheelPsi(loadKg: number, widthMm: number, surfaceFactor: number): number {
  const referenceLoadPerWheel = REFERENCE_MASS_KG * 0.5;
  const massTerm = loadKg / referenceLoadPerWheel;
  const widthTerm = REFERENCE_WIDTH_MM / widthMm;
  return BASE_PSI * massTerm * widthTerm * surfaceFactor;
}

/**
 * Recommend front/rear tyre pressure.
 *
 * Monotonic guarantees (relied on by tests):
 *   - heavier systemMass  → higher pressure
 *   - wider tyre          → lower pressure
 *   - rougher surface     → lower pressure than smooth tarmac
 *   - rear pressure ≥ front pressure at the default 52% rear split
 * All outputs clamped to per-width sane bounds and the global [15,120] psi.
 */
export function recommendTyrePressure(
  input: TyrePressureInput,
): TyrePressureRecommendation {
  const massKg = safePositive(input.systemMassKg, REFERENCE_MASS_KG);
  const widthMm = safePositive(input.tyreWidthMm, REFERENCE_WIDTH_MM);

  // Rear split clamped to a sane 40-65% so degenerate inputs can't invert the
  // weight bias or starve a wheel of load.
  const rawSplit = safePositive(input.frontRearSplitPct, 0.52);
  const rearSplit = clamp(rawSplit, 0.4, 0.65);
  const frontSplit = 1 - rearSplit;

  const surfaceFactor = SURFACE_PRESSURE_FACTOR[input.surface] ?? 1.0;

  const frontLoad = massKg * frontSplit;
  const rearLoad = massKg * rearSplit;

  const { minPsi, maxPsi } = widthBounds(widthMm);
  const lo = clamp(minPsi, GLOBAL_MIN_PSI, GLOBAL_MAX_PSI);
  const hi = clamp(maxPsi, GLOBAL_MIN_PSI, GLOBAL_MAX_PSI);

  const frontRaw = modelWheelPsi(frontLoad, widthMm, surfaceFactor);
  const rearRaw = modelWheelPsi(rearLoad, widthMm, surfaceFactor);

  const frontPsi = round1(clamp(frontRaw, lo, hi));
  const rearPsi = round1(clamp(rearRaw, lo, hi));

  const rationale =
    `For a ${round1(massKg)} kg system on ${describeSurface(input.surface)} with ` +
    `${round1(widthMm)} mm tyres: rear carries ~${Math.round(rearSplit * 100)}% of load, ` +
    `so rear runs higher. Pressure scales up with mass and down with tyre width, and is ` +
    `reduced on rough surfaces to stay below the impedance "breakpoint" where bigger casing ` +
    `vibration losses outweigh the hysteresis saving (Silca "tyre pressure as suspension"). ` +
    `Clamped to a sane ${round1(lo)}-${round1(hi)} psi window for this width.`;

  return {
    frontPsi,
    rearPsi,
    frontBar: round2(frontPsi * PSI_TO_BAR),
    rearBar: round2(rearPsi * PSI_TO_BAR),
    rationale,
  };
}

export interface CrrMultiplierInput {
  /** The pressure the rider is actually running, psi. */
  actualPsi: number;
  /** The recommended pressure for the same wheel/surface, psi. */
  recommendedPsi: number;
  /** Surface the rider is on (controls sensitivity to over-inflation). */
  surface: SurfaceType;
}

/** Lower/upper bounds on the returned Crr multiplier. Effect kept modest. */
const CRR_MULT_MIN = 0.95;
const CRR_MULT_MAX = 1.15;

/**
 * Surface sensitivity of effective Crr to *over*-inflation. On smooth tarmac the
 * impedance penalty for running hard is tiny; on cobbles/gravel it is large
 * because the casing can no longer absorb the surface and the system bounces.
 * Values are the fractional Crr change per "1.0 ratio" of relative over-pressure
 * (i.e. per +100% over recommended), clamped overall by CRR_MULT_MAX.
 */
const OVER_INFLATION_SENSITIVITY: Record<SurfaceType, number> = {
  tarmac_smooth: 0.02,
  tarmac_mixed: 0.05,
  tarmac_rough: 0.08,
  chip_seal: 0.1,
  gravel_smooth: 0.16,
  gravel_rough: 0.22,
  cobbles: 0.28,
};

/**
 * Multiplier (≈0.95-1.15) to apply to a baseline Crr when the rider runs
 * notably above/below the recommended pressure for the surface.
 *
 * Model (relative to recommended):
 *   ratio = actual / recommended
 *   - ratio > 1 (over-inflated): effective Crr RISES, strongly on rough ground
 *     (impedance/suspension losses). multiplier = 1 + sens · (ratio - 1)
 *   - ratio < 1 (under-inflated): on rough ground a little under is often
 *     FASTER (multiplier < 1) because the casing conforms; we grant a small,
 *     bounded benefit that scales with surface sensitivity, but going much too
 *     soft eventually costs (casing/pinch losses), so the benefit saturates and
 *     reverses past ~25% under.
 * Always clamped to [CRR_MULT_MIN, CRR_MULT_MAX]. Never NaN.
 */
export function crrMultiplierForPressure(input: CrrMultiplierInput): number {
  const recommended = safePositive(input.recommendedPsi, BASE_PSI);
  const actual = safePositive(input.actualPsi, recommended);
  const sens = OVER_INFLATION_SENSITIVITY[input.surface] ?? 0.05;

  const ratio = actual / recommended;

  let mult: number;
  if (ratio >= 1) {
    // Over-inflation: pay impedance, scaled by surface roughness.
    mult = 1 + sens * (ratio - 1);
  } else {
    // Under-inflation: small bounded benefit on rough ground, but it saturates
    // and reverses once you go very soft. "deficit" is how far below rec, 0..1.
    const deficit = 1 - ratio; // 0 at rec, → 1 at zero pressure
    const sweetSpot = 0.12; // ~12% under recommended ≈ best on rough ground
    // Benefit peaks near the sweet spot, then climbs back toward/above 1 as the
    // tyre gets dangerously soft (pinch/casing-flex losses).
    const benefit =
      sens * 0.5 * (1 - Math.pow((deficit - sweetSpot) / sweetSpot, 2));
    mult = 1 - benefit;
  }

  return clamp(mult, CRR_MULT_MIN, CRR_MULT_MAX);
}

function describeSurface(s: SurfaceType): string {
  return s.replace(/_/g, ' ');
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
