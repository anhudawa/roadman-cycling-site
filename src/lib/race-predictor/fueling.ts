// Evidence-based fuelling & hydration planner — the bit Best Bike Split has and
// Perdict didn't. Pure, deterministic, no I/O. Everything here is a closed-form
// function of effort duration, intensity (NP/FTP), body mass and air temperature.
//
// The numbers below are anchored to mainstream sports-nutrition guidance. Where a
// constant encodes a recommendation it carries a citation-style note so the next
// person can argue with the science, not the code.
//
// Key references:
//   [Jeukendrup 2014]  Jeukendrup A. "A step towards personalized sports
//       nutrition: carbohydrate intake during exercise." Sports Med 44(S1).
//       — 60 g/h single-transportable ceiling; up to 90 g/h with glucose+fructose
//         mixes; intake should scale with exercise duration & intensity.
//   [Jeukendrup 2010]  "Carbohydrate and exercise performance: the role of
//       multiple transportable carbohydrates." — multiple-transportable carbs
//       (2:1 glucose:fructose) lift the absorption ceiling and gut comfort.
//   [Viribay 2020] / emerging field practice — trained, gut-adapted endurance
//       athletes tolerating 100–120 g/h on long, hard days.
//   [ACSM 2007]  Sawka et al. "Exercise and fluid replacement." Med Sci Sports
//       Exerc 39(2). — fluid 0.4–0.8 L/h typical, individualise; sodium roughly
//       300–600 mg per litre of sweat (heavy/salty sweaters higher).
//   [Baker 2017]  "Sweat rate and sweat sodium concentration variability." —
//       sweat rate rises sharply with heat & intensity; sodium 200–1000+ mg/L.

/** Everything the planner needs. All scalar, all SI-ish. */
export interface FuellingInput {
  /** Total moving time of the effort, seconds. */
  durationS: number;
  /** Normalised power for the effort, watts. */
  normalizedPowerW: number;
  /** Functional threshold power, watts. */
  ftpW: number;
  /** Rider body mass, kg. */
  bodyMassKg: number;
  /** Ambient air temperature, °C. */
  airTemperatureC: number;
}

/** One clock-hour of the plan (the final entry may be a partial hour). */
export interface FuellingHour {
  /** 1-based hour index. */
  hour: number;
  /** Carbohydrate for this (possibly partial) hour, grams. */
  carbsG: number;
  /** Fluid for this (possibly partial) hour, millilitres. */
  fluidMl: number;
}

/** The structured plan handed back to the caller. */
export interface FuellingPlan {
  /** Target carbohydrate rate, g/h. */
  carbsPerHourG: number;
  /** Total carbohydrate across the whole effort, g. */
  totalCarbsG: number;
  /** Target fluid rate, ml/h. */
  fluidPerHourMl: number;
  /** Total fluid across the whole effort, ml. */
  totalFluidMl: number;
  /** Target sodium rate, mg/h (derived from fluid rate). */
  sodiumPerHourMg: number;
  /** Total sodium across the whole effort, mg. */
  totalSodiumMg: number;
  /** Optional caffeine pointer for longer/harder efforts. */
  caffeineNote?: string;
  /** Plain-language Roadman-voice summary. */
  summary: string;
  /** Hour-by-hour breakdown; integrates to the totals. */
  perHour: FuellingHour[];
}

// --- Carbohydrate model -----------------------------------------------------
// Two ceilings from [Jeukendrup 2014]: ~60 g/h is the practical limit for a
// single transportable carbohydrate (and plenty for ~1–2 h tempo work), while
// 90 g/h needs multiple transportable carbs (glucose:fructose). We let the
// genuinely long+hard days reach toward a 120 g/h field-practice ceiling, with a
// loud gut-training caveat in the summary — you don't slam 110 g/h off the couch.
const CARB_FLOOR_G_PER_H = 30; // short / easy spins: top up, don't force-feed.
const CARB_TEMPO_G_PER_H = 60; // [Jeukendrup 2014] single-transportable target.
const CARB_HARD_G_PER_H = 90; // [Jeukendrup 2010] multiple-transportable target.
const CARB_CEILING_G_PER_H = 120; // long, gut-adapted, high-intensity ceiling.

// --- Fluid model ------------------------------------------------------------
// [ACSM 2007] puts typical needs at 0.4–0.8 L/h, climbing with heat & sweat
// rate. We use a 500 ml/h baseline at a temperate reference and add fluid as the
// air warms, capped so we never recommend more than the gut can take.
const FLUID_BASE_ML_PER_H = 500; // baseline at ~20°C.
const FLUID_REF_TEMP_C = 20; // reference temperature for the baseline.
const FLUID_PER_10C_ML = 200; // +200 ml/h per 10°C above reference (mid of 150–250).
const FLUID_FLOOR_ML_PER_H = 350; // cold/easy days still need real drinking.
const FLUID_CEILING_ML_PER_H = 1000; // gut absorption ceiling [ACSM 2007].

// --- Sodium model -----------------------------------------------------------
// [ACSM 2007]/[Baker 2017]: replace roughly 300–800 mg sodium per litre of fluid.
// We scale the per-litre figure with heat as a proxy for sweat sodium losses
// (hotter day → saltier, heavier sweat), then derive the hourly figure from the
// fluid rate so the two always agree.
const SODIUM_MG_PER_L_COOL = 400; // temperate concentration.
const SODIUM_MG_PER_L_HOT = 800; // heavy-sweat / heat ceiling.
const SODIUM_HOT_REF_C = 35; // temperature at which we reach the hot concentration.

/** Clamp helper — also defuses NaN to the lower bound. */
function clamp(value: number, lo: number, hi: number): number {
  if (!Number.isFinite(value)) return lo;
  return Math.min(hi, Math.max(lo, value));
}

/**
 * Intensity factor — NP relative to FTP. Identical to the standard IF used
 * elsewhere in the engine. Guarded so a missing/zero FTP can't blow up the math.
 */
function intensityFactor(normalizedPowerW: number, ftpW: number): number {
  if (!(ftpW > 0) || !(normalizedPowerW > 0)) return 0;
  return clamp(normalizedPowerW / ftpW, 0, 2);
}

/**
 * Target carbohydrate rate, g/h.
 *
 * Carb demand is driven by BOTH how long you're out (glycogen depletion is a
 * function of time) and how hard you're going (intensity → fraction of energy
 * from carbohydrate). We build a 0–1 "demand" score from duration and IF, then
 * interpolate across the floor → tempo → hard → ceiling anchors.
 *
 *   - duration term saturates around 5 h (longer can't need *more per hour*, the
 *     hourly rate is already maxed; total keeps climbing because hours keep
 *     adding).
 *   - intensity term centres on tempo/threshold; IF ≥ ~1.0 is full demand.
 */
function carbsPerHour(durationS: number, intensity: number): number {
  const hours = durationS / 3600;

  // 0 at a standstill → ~1 by 5 h. sub-1 h efforts sit well below full demand.
  const durationTerm = clamp(hours / 5, 0, 1);
  // IF 0.55 (easy) → 0, IF 1.0+ (threshold) → 1.
  const intensityTerm = clamp((intensity - 0.55) / (1.0 - 0.55), 0, 1);

  // Both matter; weight them evenly. A long easy ride and a short hard one both
  // land mid-range; a long hard ride pushes for the ceiling.
  const demand = clamp(0.5 * durationTerm + 0.5 * intensityTerm, 0, 1);

  // Piecewise-linear across the three documented anchors so the well-known
  // 60 / 90 g/h figures fall out at recognisable demand levels.
  //   demand 0    → floor (30)
  //   demand 0.5  → tempo (60)
  //   demand 0.8  → hard  (90)
  //   demand 1    → ceiling (120)
  let rate: number;
  if (demand <= 0.5) {
    rate = CARB_FLOOR_G_PER_H + (demand / 0.5) * (CARB_TEMPO_G_PER_H - CARB_FLOOR_G_PER_H);
  } else if (demand <= 0.8) {
    rate =
      CARB_TEMPO_G_PER_H +
      ((demand - 0.5) / 0.3) * (CARB_HARD_G_PER_H - CARB_TEMPO_G_PER_H);
  } else {
    rate =
      CARB_HARD_G_PER_H +
      ((demand - 0.8) / 0.2) * (CARB_CEILING_G_PER_H - CARB_HARD_G_PER_H);
  }

  return clamp(Math.round(rate), CARB_FLOOR_G_PER_H, CARB_CEILING_G_PER_H);
}

/**
 * Target fluid rate, ml/h. Linear in air temperature above the reference,
 * clamped both ends. Cold days never drop below the floor; hot days never exceed
 * what the gut can absorb.
 */
function fluidPerHour(airTemperatureC: number): number {
  const overReference = airTemperatureC - FLUID_REF_TEMP_C;
  const raw = FLUID_BASE_ML_PER_H + (overReference / 10) * FLUID_PER_10C_ML;
  return clamp(Math.round(raw), FLUID_FLOOR_ML_PER_H, FLUID_CEILING_ML_PER_H);
}

/**
 * Sodium concentration to aim for, mg per litre of fluid. Scales linearly with
 * heat between the cool and hot anchors. Clamped to the documented band.
 */
function sodiumMgPerLitre(airTemperatureC: number): number {
  const frac = clamp(
    (airTemperatureC - FLUID_REF_TEMP_C) / (SODIUM_HOT_REF_C - FLUID_REF_TEMP_C),
    0,
    1,
  );
  const conc =
    SODIUM_MG_PER_L_COOL + frac * (SODIUM_MG_PER_L_HOT - SODIUM_MG_PER_L_COOL);
  return clamp(Math.round(conc), SODIUM_MG_PER_L_COOL, SODIUM_MG_PER_L_HOT);
}

/**
 * Caffeine pointer. [Burke 2008] ~3–6 mg/kg is the performance-tested window,
 * worth flagging for efforts long or hard enough to benefit. We only return a
 * note (no hard target) — caffeine is the most individual variable here.
 */
function caffeineNote(durationS: number, intensity: number, bodyMassKg: number): string | undefined {
  const hours = durationS / 3600;
  const wantsCaffeine = hours >= 1.5 || intensity >= 0.9;
  if (!wantsCaffeine || !(bodyMassKg > 0)) return undefined;
  // 3–6 mg/kg [Burke 2008]; quote the rider's own bracket.
  const lo = Math.round(3 * bodyMassKg);
  const hi = Math.round(6 * bodyMassKg);
  return `Caffeine: ${lo}–${hi} mg total works for most (3–6 mg/kg). Take the bulk 30–60 min before the hard bit, not all at the start.`;
}

/**
 * Build the hour-by-hour breakdown. Each full hour gets the full rate; the final
 * partial hour is pro-rated by the leftover fraction so the per-hour entries
 * integrate exactly to the totals.
 */
function buildPerHour(
  durationS: number,
  carbsPerHourG: number,
  fluidPerHourMl: number,
): FuellingHour[] {
  const out: FuellingHour[] = [];
  let remaining = durationS;
  let hour = 1;
  while (remaining > 0) {
    const fraction = Math.min(1, remaining / 3600);
    out.push({
      hour,
      carbsG: Math.round(carbsPerHourG * fraction),
      fluidMl: Math.round(fluidPerHourMl * fraction),
    });
    remaining -= 3600;
    hour += 1;
  }
  return out;
}

/** Roadman-voice summary — practical, direct, no fluff. */
function buildSummary(
  durationS: number,
  carbsPerHourG: number,
  fluidPerHourMl: number,
  sodiumPerHourMg: number,
): string {
  const hours = durationS / 3600;
  const hoursLabel =
    hours >= 1 ? `${hours.toFixed(1).replace(/\.0$/, '')} h` : `${Math.round(durationS / 60)} min`;

  const gutLine =
    carbsPerHourG >= 90
      ? ' That carb number is high — train your gut for it in the weeks before, don\'t test it on race day.'
      : '';
  const heatLine =
    fluidPerHourMl >= 800
      ? ' It\'s hot: keep the bottle moving and don\'t wait until you\'re thirsty.'
      : '';

  return (
    `For this ${hoursLabel} effort: aim for ${carbsPerHourG} g of carbs, ` +
    `${fluidPerHourMl} ml of fluid and ${sodiumPerHourMg} mg of sodium every hour. ` +
    `Start fuelling in the first 20 minutes and keep it steady — playing catch-up never works.` +
    gutLine +
    heatLine
  );
}

/**
 * Plan fuelling & hydration for an effort. Pure and deterministic: same input,
 * same plan, every time. Degenerate inputs (zero/negative duration, missing FTP)
 * yield a safe empty/floor plan rather than NaN or negatives.
 */
export function planFuelling(input: FuellingInput): FuellingPlan {
  const durationS = Number.isFinite(input.durationS) ? input.durationS : 0;
  const bodyMassKg = Number.isFinite(input.bodyMassKg) ? input.bodyMassKg : 0;
  const airTemperatureC = Number.isFinite(input.airTemperatureC)
    ? input.airTemperatureC
    : FLUID_REF_TEMP_C;

  // Guard the degenerate case: nothing to fuel.
  if (durationS <= 0) {
    return {
      carbsPerHourG: 0,
      totalCarbsG: 0,
      fluidPerHourMl: 0,
      totalFluidMl: 0,
      sodiumPerHourMg: 0,
      totalSodiumMg: 0,
      summary: 'No effort, no plan — give me a duration and I\'ll give you a fuelling strategy.',
      perHour: [],
    };
  }

  const hours = durationS / 3600;
  const intensity = intensityFactor(input.normalizedPowerW, input.ftpW);

  const carbsPerHourG = carbsPerHour(durationS, intensity);
  const fluidPerHourMl = fluidPerHour(airTemperatureC);

  const sodiumConc = sodiumMgPerLitre(airTemperatureC);
  // Sodium per hour follows the fluid rate so the two never contradict.
  const sodiumPerHourMg = clamp(
    Math.round((fluidPerHourMl / 1000) * sodiumConc),
    0,
    // (1000 ml/h ceiling × 800 mg/L) is the hard upper bound.
    (FLUID_CEILING_ML_PER_H / 1000) * SODIUM_MG_PER_L_HOT,
  );

  const perHour = buildPerHour(durationS, carbsPerHourG, fluidPerHourMl);

  // Totals: integrate the rate over the (possibly fractional) hours. This equals
  // the sum of the per-hour entries up to rounding, which the tests pin down.
  const totalCarbsG = Math.round(carbsPerHourG * hours);
  const totalFluidMl = Math.round(fluidPerHourMl * hours);
  const totalSodiumMg = Math.round(sodiumPerHourMg * hours);

  return {
    carbsPerHourG,
    totalCarbsG,
    fluidPerHourMl,
    totalFluidMl,
    sodiumPerHourMg,
    totalSodiumMg,
    caffeineNote: caffeineNote(durationS, intensity, bodyMassKg),
    summary: buildSummary(durationS, carbsPerHourG, fluidPerHourMl, sodiumPerHourMg),
    perHour,
  };
}
