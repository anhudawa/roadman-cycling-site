/**
 * Pure calculator functions used by both the on-page tools and the
 * public /api/v1/tools/* JSON endpoints. Keep these deterministic and
 * side-effect free so server route handlers can import them safely.
 */

export type FtpZone = {
  zone: number;
  name: string;
  minPercentFtp: number;
  maxPercentFtp: number | null;
  minWatts: number;
  maxWatts: number | null;
  minPercentLthr: number;
  maxPercentLthr: number | null;
  minBpm: number | null;
  maxBpm: number | null;
  description: string;
};

const FTP_ZONE_DEFS: Array<{
  zone: number;
  name: string;
  minPercentFtp: number;
  maxPercentFtp: number | null;
  minPercentLthr: number;
  maxPercentLthr: number | null;
  description: string;
}> = [
  { zone: 1, name: "Active Recovery", minPercentFtp: 0,   maxPercentFtp: 55,   minPercentLthr: 0,   maxPercentLthr: 68,  description: "Easy spinning, recovery rides, coffee stops." },
  { zone: 2, name: "Endurance",       minPercentFtp: 56,  maxPercentFtp: 75,   minPercentLthr: 69,  maxPercentLthr: 83,  description: "Conversational pace. Build the aerobic base here." },
  { zone: 3, name: "Tempo",           minPercentFtp: 76,  maxPercentFtp: 90,   minPercentLthr: 84,  maxPercentLthr: 94,  description: "Comfortably hard. Moderate aerobic work." },
  { zone: 4, name: "Threshold",       minPercentFtp: 91,  maxPercentFtp: 105,  minPercentLthr: 95,  maxPercentLthr: 105, description: "At or near FTP. Sustainable for 20–60 minutes." },
  { zone: 5, name: "VO2 Max",         minPercentFtp: 106, maxPercentFtp: 120,  minPercentLthr: 106, maxPercentLthr: null, description: "Very hard. 3–8 minute intervals only." },
  { zone: 6, name: "Anaerobic",       minPercentFtp: 121, maxPercentFtp: 150,  minPercentLthr: 106, maxPercentLthr: null, description: "Short, high-intensity efforts. 30s–2 min." },
  { zone: 7, name: "Neuromuscular",   minPercentFtp: 151, maxPercentFtp: null, minPercentLthr: 106, maxPercentLthr: null, description: "Sprints. 5–15 second maximal efforts." },
];

export function calculateFtpZones(ftp: number, lthr?: number): FtpZone[] {
  return FTP_ZONE_DEFS.map((z) => ({
    zone: z.zone,
    name: z.name,
    minPercentFtp: z.minPercentFtp,
    maxPercentFtp: z.maxPercentFtp,
    minWatts: Math.round((z.minPercentFtp / 100) * ftp),
    maxWatts: z.maxPercentFtp === null ? null : Math.round((z.maxPercentFtp / 100) * ftp),
    minPercentLthr: z.minPercentLthr,
    maxPercentLthr: z.maxPercentLthr,
    minBpm: lthr ? Math.round((z.minPercentLthr / 100) * lthr) : null,
    maxBpm: lthr && z.maxPercentLthr !== null ? Math.round((z.maxPercentLthr / 100) * lthr) : null,
    description: z.description,
  }));
}

export type RaceWeightEvent = "road-race" | "gran-fondo" | "hill-climb" | "time-trial" | "gravel";
export type RaceWeightGender = "male" | "female";

export interface RaceWeightInput {
  heightCm: number;
  currentWeightKg: number;
  bodyFatPercent: number;
  eventType: RaceWeightEvent;
  gender: RaceWeightGender;
}

export interface RaceWeightResult {
  targetWeightMin: number;
  targetWeightMax: number;
  targetBfMin: number;
  targetBfMax: number;
  weeksToTarget: number;
  approach: string;
}

const RACE_WEIGHT_TARGET_BF: Record<RaceWeightEvent, Record<RaceWeightGender, [number, number]>> = {
  "road-race":  { male: [8, 12],  female: [16, 22] },
  "gran-fondo": { male: [10, 14], female: [18, 24] },
  "hill-climb": { male: [7, 10],  female: [14, 19] },
  "time-trial": { male: [10, 14], female: [18, 24] },
  "gravel":     { male: [10, 15], female: [18, 25] },
};

export function calculateRaceWeight(input: RaceWeightInput): RaceWeightResult {
  const { heightCm, currentWeightKg, bodyFatPercent, eventType, gender } = input;

  const [bfMin, bfMax] = RACE_WEIGHT_TARGET_BF[eventType][gender];
  const leanMass = currentWeightKg * (1 - bodyFatPercent / 100);
  const targetMin = leanMass / (1 - bfMin / 100);
  const targetMax = leanMass / (1 - bfMax / 100);

  // Miller-formula minimum healthy weight, used as a floor so we never
  // recommend below medically reasonable.
  const heightFloor = gender === "male"
    ? 56.2 + 1.41 * ((heightCm - 152.4) / 2.54)
    : 53.1 + 1.36 * ((heightCm - 152.4) / 2.54);
  const safeMin = Math.max(targetMin, heightFloor);

  const midTarget = (safeMin + targetMax) / 2;
  const weightToLose = Math.max(0, currentWeightKg - midTarget);
  const weeklyLoss = currentWeightKg * 0.005;
  const weeks = weeklyLoss > 0 ? Math.ceil(weightToLose / weeklyLoss) : 0;

  let approach: string;
  if (weeks === 0) {
    approach = "You're already within your target race weight range. Focus on maintaining body composition while building power.";
  } else if (weeks <= 8) {
    approach = "A moderate deficit through better food quality and fuelling timing. No need to restrict calories — just eat smarter around your training.";
  } else if (weeks <= 16) {
    approach = "A structured body composition phase. Focus on protein adequacy (1.6-2.2g/kg), fuelling your key sessions, and creating a small deficit on easy days.";
  } else {
    approach = "A longer-term approach is needed. Prioritise slow, sustainable change — 0.5% body weight per week maximum. Faster than that and you risk losing power, getting sick, or developing an unhealthy relationship with food.";
  }

  return {
    targetWeightMin: Math.round(safeMin * 10) / 10,
    targetWeightMax: Math.round(targetMax * 10) / 10,
    targetBfMin: bfMin,
    targetBfMax: bfMax,
    weeksToTarget: weeks,
    approach,
  };
}

export const RACE_WEIGHT_EVENTS: RaceWeightEvent[] = [
  "road-race",
  "gran-fondo",
  "hill-climb",
  "time-trial",
  "gravel",
];

export const RACE_WEIGHT_GENDERS: RaceWeightGender[] = ["male", "female"];

// =============================================================================
// IN-RIDE FUELLING (carbs, fluid, sodium per hour)
// =============================================================================
//
// Evidence base:
//  - Coyle (1992): gross efficiency ~22-25% for trained cyclists
//  - Romijn et al. (1993): substrate utilisation by intensity (RER)
//  - Jeukendrup (2014): dual-transporter model, gut training ceilings
//  - Sawka et al. (2007) ACSM: sweat rate, heat, fluid replacement
//  - Baker et al. (2016): sweat sodium concentration
//
// All inputs are validated by callers — function trusts ranges. UI components
// should still gate min/max on inputs (10-720min, 30-200kg, 30-600W).
//
// Carbohydrate calc (physics-based):
//   metabolicRateKJhr = (targetWatts × 3.6) / 0.23      // gross efficiency 23%
//   carbKJhr          = metabolicRateKJhr × carbFraction
//   carbOxidation     = carbKJhr / 16.7                  // 1g carb = 16.7 kJ
// Then duration modifier, gut-training ceiling, and dual-source split apply.

export type FuellingSessionType =
  | "recovery"
  | "endurance"
  | "tempo"
  | "sweetspot"
  | "threshold"
  | "vo2"
  | "intervals"
  | "race";

export type FuellingGutTraining = "none" | "some" | "trained";

export type FuellingHeatCategory = "cool" | "mild" | "warm" | "hot";

export interface FuellingSessionProfile {
  label: string;
  ftpRange: string;
  carbFraction: number;
  sweatMultiplier: number;
  description: string;
}

export const FUELLING_SESSION_PROFILES: Record<FuellingSessionType, FuellingSessionProfile> = {
  recovery: {
    label: "Recovery Spin",
    ftpRange: "<55% FTP",
    carbFraction: 0.30,
    sweatMultiplier: 0.7,
    description: "Easy spin, active recovery. Primarily fat oxidation.",
  },
  endurance: {
    label: "Endurance / Z2",
    ftpRange: "55-75% FTP",
    carbFraction: 0.50,
    sweatMultiplier: 0.85,
    description: "Steady aerobic riding. Mixed fat and carb oxidation.",
  },
  tempo: {
    label: "Tempo / Z3",
    ftpRange: "76-87% FTP",
    carbFraction: 0.65,
    sweatMultiplier: 1.0,
    description: "Sustained moderate effort. Meaningful glycogen use.",
  },
  sweetspot: {
    label: "Sweet Spot",
    ftpRange: "88-94% FTP",
    carbFraction: 0.75,
    sweatMultiplier: 1.1,
    description: "Just below threshold. High glycolytic demand.",
  },
  threshold: {
    label: "Threshold / Z4",
    ftpRange: "95-105% FTP",
    carbFraction: 0.85,
    sweatMultiplier: 1.2,
    description: "At or near FTP. Very high carb oxidation rate.",
  },
  vo2: {
    label: "VO2max Intervals",
    ftpRange: "106-120% FTP",
    carbFraction: 0.90,
    sweatMultiplier: 1.3,
    description: "Repeated hard efforts with recovery. Highest glycolytic demand.",
  },
  intervals: {
    label: "Mixed Intervals",
    ftpRange: "Variable",
    carbFraction: 0.70,
    sweatMultiplier: 1.15,
    description: "Varied intensity session (e.g. group ride, fartlek, crits). High avg carb burn from surges.",
  },
  race: {
    label: "Race / Sportive",
    ftpRange: "Variable, sustained",
    carbFraction: 0.85,
    sweatMultiplier: 1.25,
    description: "Competitive effort with surges. Maximum fuelling needed.",
  },
};

const GUT_TRAINING_CEILING: Record<FuellingGutTraining, number> = {
  none: 70,
  some: 90,
  trained: 120,
};

export interface FuellingWeather {
  temperature: number; // °C
  humidity: number;    // %
  location?: string;
}

export interface FuellingInput {
  durationMin: number;
  sessionType: FuellingSessionType;
  targetWatts: number;
  weightKg: number;
  gutTraining: FuellingGutTraining;
  weather?: FuellingWeather | null;
}

export interface FuellingResult {
  carbsPerHour: number;
  totalCarbs: number;
  fluidPerHour: number;       // ml
  totalFluid: number;          // litres (rounded to 0.1)
  sodiumPerHour: number;       // mg
  glucosePerHour: number;
  fructosePerHour: number;
  strategy: string[];
  feedingInterval: number;     // minutes
  startFuellingAt: number;     // minutes into ride
  dualSource: boolean;
  heatCategory: FuellingHeatCategory;
  weatherNote: string | null;
  intensityLabel: string;
}

export function calculateFuelling(input: FuellingInput): FuellingResult {
  const { durationMin, sessionType, targetWatts, weightKg, gutTraining } = input;
  const weather = input.weather ?? null;
  const hours = durationMin / 60;
  const profile = FUELLING_SESSION_PROFILES[sessionType];

  // --- Carbohydrate calculation ---
  const grossEfficiency = 0.23;
  const metabolicRateKJhr = (targetWatts * 3.6) / grossEfficiency;
  const carbKJhr = metabolicRateKJhr * profile.carbFraction;
  const carbOxidation = carbKJhr / 16.7;

  let durationMod: number;
  if (durationMin <= 60) durationMod = 0.75;
  else if (durationMin <= 90) durationMod = 0.9;
  else if (durationMin <= 150) durationMod = 1.0;
  else if (durationMin <= 240) durationMod = 1.05;
  else durationMod = 1.1;

  const rawCarbs = carbOxidation * durationMod;
  const carbsPerHour = Math.round(
    Math.min(GUT_TRAINING_CEILING[gutTraining], Math.max(0, rawCarbs)),
  );
  const totalCarbs = Math.round(carbsPerHour * hours);

  // Glucose:fructose split — dual-transporter model above 60g/hr (Jeukendrup 1:0.8)
  const dualSource = carbsPerHour > 60;
  let glucosePerHour: number;
  let fructosePerHour: number;
  if (dualSource) {
    glucosePerHour = Math.round(carbsPerHour / 1.8);
    fructosePerHour = Math.round(carbsPerHour - glucosePerHour);
  } else {
    glucosePerHour = carbsPerHour;
    fructosePerHour = 0;
  }

  // --- Heat category ---
  let heatCategory: FuellingHeatCategory = "mild";
  let heatMultiplier = 1.0;
  let weatherNote: string | null = null;

  if (weather) {
    const heatIndex = weather.temperature
      + (weather.humidity > 60 ? (weather.humidity - 60) * 0.15 : 0);
    const loc = weather.location ?? "Conditions";
    if (heatIndex < 12) {
      heatCategory = "cool"; heatMultiplier = 0.8;
      weatherNote = `${loc}: ${weather.temperature}°C, ${weather.humidity}% humidity — cool conditions.`;
    } else if (heatIndex < 22) {
      heatCategory = "mild"; heatMultiplier = 1.0;
      weatherNote = `${loc}: ${weather.temperature}°C, ${weather.humidity}% humidity — standard conditions.`;
    } else if (heatIndex < 30) {
      heatCategory = "warm"; heatMultiplier = 1.25;
      weatherNote = `${loc}: ${weather.temperature}°C, ${weather.humidity}% humidity — warm. Increase fluid and sodium.`;
    } else {
      heatCategory = "hot"; heatMultiplier = 1.5;
      weatherNote = `${loc}: ${weather.temperature}°C, ${weather.humidity}% humidity — hot. Significantly increase fluid and sodium.`;
    }
  }

  // --- Fluid (Sawka et al.) ---
  const baseFluidPerKg = 7 * profile.sweatMultiplier;
  const rawFluid = Math.round(weightKg * baseFluidPerKg * heatMultiplier);
  const fluidPerHour = Math.max(300, Math.min(1200, rawFluid));
  const totalFluid = Math.round((fluidPerHour * hours) / 100) / 10;

  // --- Sodium (Baker et al.) ---
  const sweatRateLHr = (fluidPerHour / 1000) * 1.4;
  const sweatSodiumConc = 800; // mg/L moderate population estimate
  const sodiumPerHour = Math.round(sweatRateLHr * sweatSodiumConc);

  const startFuellingAt = durationMin <= 60 ? 30 : durationMin <= 90 ? 20 : 15;
  const feedingInterval = carbsPerHour >= 80 ? 15 : 20;

  // --- Strategy notes ---
  const strategy: string[] = [];
  if (durationMin <= 45) {
    strategy.push("Under 45 minutes: water is sufficient. A carbohydrate mouth rinse can improve performance by 2-3% without needing to digest anything (Chambers et al. 2009).");
  } else if (durationMin <= 75) {
    strategy.push(`A ${profile.label.toLowerCase()} session for ${durationMin} minutes burns roughly ${carbsPerHour}g carbs/hr. Start fuelling at ${startFuellingAt} minutes with a gel or energy drink every 20 minutes.`);
  } else if (durationMin <= 150) {
    strategy.push(`A ${durationMin}-minute ${profile.label.toLowerCase()} session has a carb oxidation rate of ~${carbsPerHour}g/hr. Start within the first ${startFuellingAt} minutes — set a timer every ${feedingInterval} minutes.`);
    if (dualSource) {
      strategy.push(`At ${carbsPerHour}g/hr you need dual-source products (glucose + fructose at 1:0.8). Single-source glucose saturates at ~60g/hr — fructose uses the GLUT5 transporter independently.`);
    }
  } else {
    strategy.push(`${durationMin} minutes of ${profile.label.toLowerCase()} requires ${carbsPerHour}g carbs/hr — that's ~${Math.round(carbsPerHour / (60 / feedingInterval))}g every ${feedingInterval} minutes. Front-load your intake. It's far easier to maintain glycogen than recover from depletion.`);
    if (dualSource) {
      strategy.push("Dual-source (glucose:fructose 1:0.8) is essential at this rate. Mix gels, energy drink, and real food (rice cakes, bars). Flavour fatigue is real after 3+ hours.");
    }
  }
  if (sessionType === "intervals" || sessionType === "vo2") {
    strategy.push("Interval sessions have high peak glycolytic demand during efforts, even if average power is moderate. Fuel for the efforts, not the recovery valleys — your muscles are burning through glycogen during those hard reps.");
  }
  if (gutTraining === "none" && carbsPerHour > 50) {
    strategy.push(`Your target is ${carbsPerHour}g/hr but without gut training, start at 40-50g/hr and build by 5-10g per week over 4-6 weeks (Jeukendrup & McLaughlin, 2011). The gut adapts — trained athletes absorb double what beginners tolerate.`);
  }
  if (heatCategory === "warm" || heatCategory === "hot") {
    strategy.push(`${heatCategory === "hot" ? "Hot" : "Warm"} conditions detected. Sweat rate increases 20-30% per 5°C above 20°C (Sawka et al.). Prioritise fluid and sodium — dehydration above 2% bodyweight meaningfully impairs performance.`);
  }

  return {
    carbsPerHour,
    totalCarbs,
    fluidPerHour,
    totalFluid,
    sodiumPerHour,
    glucosePerHour,
    fructosePerHour,
    strategy,
    feedingInterval,
    startFuellingAt,
    dualSource,
    heatCategory,
    weatherNote,
    intensityLabel: profile.label,
  };
}

// =============================================================================
// SPORTIVE FINISH-TIME PREDICTOR (FTP + event → time)
// =============================================================================
//
// Lightweight predictor that wraps the race-predictor power-balance solver
// (`solveSpeedFromPower`) over a synthesised 3-segment course: a climb at 6%,
// the matching descent at -6%, and the remaining flat. Adequate for the
// embeddable widget; the full /tools/race-predictor page uses GPX parsing,
// CP/W' fits, and durability decay for proper accuracy.
//
// Defaults (endurance hoods @ 0.34 m² CdA, smooth tarmac Crr, 8kg bike,
// ~75% FTP for sportive pacing) are tuned to ±5-10% on common European
// gran fondos when riders pace sensibly.

import { solveSpeedFromPower } from "@/lib/race-predictor/engine";

export type SportiveEventKey =
  | "etape"
  | "marmotte"
  | "fred-whitton"
  | "mallorca-312"
  | "maratona-dolomites"
  | "ride-london-100"
  | "custom";

export interface SportiveEventPreset {
  key: Exclude<SportiveEventKey, "custom">;
  name: string;
  location: string;
  distanceKm: number;
  elevationM: number;
  blurb: string;
}

export const SPORTIVE_EVENTS: SportiveEventPreset[] = [
  {
    key: "etape",
    name: "L'Étape du Tour",
    location: "France",
    distanceKm: 130,
    elevationM: 4000,
    blurb: "Mass-participation event on a Tour de France stage.",
  },
  {
    key: "marmotte",
    name: "La Marmotte",
    location: "Alpe d'Huez, France",
    distanceKm: 175,
    elevationM: 5000,
    blurb: "Glandon, Télégraphe, Galibier, Alpe d'Huez. The benchmark.",
  },
  {
    key: "maratona-dolomites",
    name: "Maratona dles Dolomites",
    location: "Italy",
    distanceKm: 138,
    elevationM: 4230,
    blurb: "Seven Dolomite passes. Iconic Italian gran fondo.",
  },
  {
    key: "fred-whitton",
    name: "Fred Whitton Challenge",
    location: "Lake District, UK",
    distanceKm: 180,
    elevationM: 4000,
    blurb: "Honister, Newlands, Whinlatter, Hardknott, Wrynose.",
  },
  {
    key: "mallorca-312",
    name: "Mallorca 312",
    location: "Spain",
    distanceKm: 312,
    elevationM: 5000,
    blurb: "The longest of the European mass-start events.",
  },
  {
    key: "ride-london-100",
    name: "Ride London 100",
    location: "UK",
    distanceKm: 161,
    elevationM: 800,
    blurb: "Closed-road London-Surrey loop. Mostly flat.",
  },
];

export interface SportiveInput {
  ftp: number;             // watts
  weightKg: number;        // rider mass
  bikeKg?: number;         // default 8
  distanceKm: number;
  elevationM: number;
  pacingPercent?: number;  // % of FTP, default 75
  cda?: number;            // default 0.34 (endurance hoods)
  crr?: number;            // default 0.0040 (mixed tarmac)
  airDensity?: number;     // default 1.225 (sea level, 15°C)
}

export interface SportiveResult {
  totalSeconds: number;
  averageSpeedKph: number;
  climbingTimeSeconds: number;
  descentTimeSeconds: number;
  flatTimeSeconds: number;
  averagePowerW: number;
  wattsPerKg: number;
  pacingPercent: number;
}

const SPORTIVE_DEFAULT_CLIMB_GRADIENT = 0.06;     // 6% — typical alpine climbs
const SPORTIVE_DRIVETRAIN_EFFICIENCY = 0.97;
const SPORTIVE_DESCENT_POWER_W = 50;              // coast-with-occasional-pedalling

export function calculateSportiveTime(input: SportiveInput): SportiveResult {
  const ftp = input.ftp;
  const weightKg = input.weightKg;
  const bikeKg = input.bikeKg ?? 8;
  const totalDistanceM = input.distanceKm * 1000;
  const elevationGainM = input.elevationM;
  const pacingPercent = input.pacingPercent ?? 75;
  const cda = input.cda ?? 0.34;
  const crr = input.crr ?? 0.0040;
  const airDensity = input.airDensity ?? 1.225;

  const ridingPower = (pacingPercent / 100) * ftp;
  const totalMass = weightKg + bikeKg;

  // Synthesise climb / descent / flat split.
  let climbGradient = SPORTIVE_DEFAULT_CLIMB_GRADIENT;
  let climbDistance = elevationGainM / Math.sin(Math.atan(climbGradient));
  if (2 * climbDistance > totalDistanceM) {
    // Course is too mountainous for 6% — split distance evenly and steepen
    // the implied climb gradient to absorb all elevation gain.
    climbDistance = totalDistanceM / 2;
    if (climbDistance > 0) {
      climbGradient = Math.atan(elevationGainM / climbDistance);
    }
  } else {
    climbGradient = Math.atan(climbGradient); // convert tan ratio to radians
  }
  const descentDistance = climbDistance;
  const flatDistance = Math.max(0, totalDistanceM - climbDistance - descentDistance);

  const climbSpeed = solveSpeedFromPower({
    power: ridingPower,
    mass: totalMass,
    gradient: climbGradient,
    crr,
    cda,
    airDensity,
    headwind: 0,
    drivetrainEfficiency: SPORTIVE_DRIVETRAIN_EFFICIENCY,
  });
  const descentSpeed = solveSpeedFromPower({
    power: SPORTIVE_DESCENT_POWER_W,
    mass: totalMass,
    gradient: -climbGradient,
    crr,
    cda,
    airDensity,
    headwind: 0,
    drivetrainEfficiency: SPORTIVE_DRIVETRAIN_EFFICIENCY,
  });
  const flatSpeed = flatDistance > 0
    ? solveSpeedFromPower({
        power: ridingPower,
        mass: totalMass,
        gradient: 0,
        crr,
        cda,
        airDensity,
        headwind: 0,
        drivetrainEfficiency: SPORTIVE_DRIVETRAIN_EFFICIENCY,
      })
    : 0;

  const climbingTimeSeconds = climbDistance / climbSpeed;
  const descentTimeSeconds = descentDistance / descentSpeed;
  const flatTimeSeconds = flatSpeed > 0 ? flatDistance / flatSpeed : 0;
  const totalSeconds = climbingTimeSeconds + descentTimeSeconds + flatTimeSeconds;

  const averageSpeedKph = totalSeconds > 0
    ? (totalDistanceM / totalSeconds) * 3.6
    : 0;

  // Energy-weighted average power across the three segments.
  const totalEnergyKj
    = (ridingPower * climbingTimeSeconds
     + SPORTIVE_DESCENT_POWER_W * descentTimeSeconds
     + ridingPower * flatTimeSeconds) / 1000;
  const averagePowerW = totalSeconds > 0
    ? (totalEnergyKj * 1000) / totalSeconds
    : 0;

  return {
    totalSeconds,
    averageSpeedKph,
    climbingTimeSeconds,
    descentTimeSeconds,
    flatTimeSeconds,
    averagePowerW,
    wattsPerKg: ftp / weightKg,
    pacingPercent,
  };
}

export function formatHms(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ---------------------------------------------------------------------------
// Carbs-per-hour (simpler band-based model used by /api/v1/tools/carbs-per-hour)
// Distinct from the richer in-ride fuelling calculator above; this one takes
// just weight + intensity + duration and returns per-hour carb targets,
// glucose:fructose split, and a feeding interval. Used by the public API.
// ---------------------------------------------------------------------------

export type CarbIntensity = "easy" | "endurance" | "tempo" | "threshold" | "race";

export interface CarbsPerHourInput {
  weightKg: number;
  intensity: CarbIntensity;
  durationMin: number;
}

export interface CarbsPerHourResult {
  carbsPerHour: number;
  totalCarbs: number;
  glucosePerHour: number;
  fructosePerHour: number;
  feedingIntervalMin: number;
  startFuellingAtMin: number;
  dualSource: boolean;
  rationale: string;
}

/**
 * Carbs per hour bands derived from Jeukendrup, Burke, and Morton consensus
 * for endurance cycling. Bands widen with duration; harder intensities push
 * toward the upper end. Above 60 g/hr we recommend a 2:1 glucose:fructose
 * split to use both intestinal transporters (SGLT1 and GLUT5).
 */
const CARB_BANDS: Record<CarbIntensity, { short: [number, number]; long: [number, number]; label: string }> = {
  easy:       { short: [0, 30],   long: [20, 40],   label: "Easy / recovery — fat is the dominant fuel; carbs only become useful after ~90 minutes." },
  endurance:  { short: [30, 50],  long: [50, 80],   label: "Endurance / Z2 — mixed fat and carbohydrate oxidation; fuel sustainably." },
  tempo:      { short: [50, 70],  long: [70, 90],   label: "Tempo / Z3 — meaningful glycogen drain; fuel from the first 30 minutes." },
  threshold:  { short: [60, 80],  long: [80, 100],  label: "Threshold / Z4 — high carbohydrate oxidation; eat earlier and more often than feels intuitive." },
  race:       { short: [80, 100], long: [90, 120],  label: "Race / very hard — maximum sustainable rate; requires a trained gut and a 2:1 glucose:fructose source." },
};

export const CARB_INTENSITIES: CarbIntensity[] = ["easy", "endurance", "tempo", "threshold", "race"];

export function calculateCarbsPerHour(input: CarbsPerHourInput): CarbsPerHourResult {
  const { weightKg, intensity, durationMin } = input;
  const isLong = durationMin >= 120;
  const band = CARB_BANDS[intensity];
  const [bandMin, bandMax] = isLong ? band.long : band.short;

  // Bias toward the upper end of the band for heavier riders, since larger
  // riders burn more total energy per hour at the same RPE.
  const weightBias = Math.min(1, Math.max(0, (weightKg - 60) / 30));
  const carbsPerHour = Math.round(bandMin + (bandMax - bandMin) * weightBias);
  const totalCarbs = Math.round((carbsPerHour * durationMin) / 60);

  const dualSource = carbsPerHour > 60;
  const glucosePerHour = dualSource ? Math.round((carbsPerHour * 2) / 3) : carbsPerHour;
  const fructosePerHour = dualSource ? carbsPerHour - glucosePerHour : 0;

  const feedingIntervalMin = carbsPerHour <= 30 ? 30 : carbsPerHour <= 60 ? 20 : 15;
  const startFuellingAtMin = intensity === "easy" ? 90 : intensity === "endurance" ? 30 : 20;

  return {
    carbsPerHour,
    totalCarbs,
    glucosePerHour,
    fructosePerHour,
    feedingIntervalMin,
    startFuellingAtMin,
    dualSource,
    rationale: band.label,
  };
}

// ---------------------------------------------------------------------------
// Training plan outline
// ---------------------------------------------------------------------------

export type TrainingGoal = "ftp" | "gran-fondo" | "race" | "weight-loss" | "general-fitness";
export type TrainingExperience = "novice" | "intermediate" | "advanced";

export interface TrainingPlanInput {
  goal: TrainingGoal;
  ftp: number;
  hoursPerWeek: number;
  weeks: number;
  experience?: TrainingExperience;
}

export interface TrainingWeekOutline {
  week: number;
  phase: string;
  focus: string;
  totalHours: number;
  z1z2Hours: number;
  z3Hours: number;
  z4PlusHours: number;
  keySessions: string[];
}

export interface TrainingPlanResult {
  goal: TrainingGoal;
  weeks: number;
  ftp: number;
  weeklyAverageHours: number;
  intensityDistribution: { z1z2Pct: number; z3Pct: number; z4PlusPct: number };
  phases: Array<{ name: string; weeks: number; focus: string }>;
  weeklyOutlines: TrainingWeekOutline[];
  notes: string[];
}

export const TRAINING_GOALS: TrainingGoal[] = [
  "ftp",
  "gran-fondo",
  "race",
  "weight-loss",
  "general-fitness",
];

export const TRAINING_EXPERIENCES: TrainingExperience[] = [
  "novice",
  "intermediate",
  "advanced",
];

const GOAL_PROFILE: Record<TrainingGoal, {
  intensity: { z1z2Pct: number; z3Pct: number; z4PlusPct: number };
  phaseFocus: { base: string; build: string; peak: string; taper: string };
}> = {
  ftp: {
    intensity: { z1z2Pct: 75, z3Pct: 10, z4PlusPct: 15 },
    phaseFocus: {
      base: "Aerobic volume, sweet-spot tolerance, consistency.",
      build: "2 × threshold sessions per week; one VO2 session per fortnight.",
      peak: "Threshold and VO2 work at race-specific durations.",
      taper: "Maintain intensity, drop volume 40-60%, fresh legs for retest.",
    },
  },
  "gran-fondo": {
    intensity: { z1z2Pct: 80, z3Pct: 12, z4PlusPct: 8 },
    phaseFocus: {
      base: "Long Z2 rides, climbing volume, fuelling practice.",
      build: "Event-specific climbs, sweet-spot intervals, back-to-back rides.",
      peak: "Race simulation, pacing rehearsal, full event fuelling.",
      taper: "Reduce volume, keep one intensity day, sharpen.",
    },
  },
  race: {
    intensity: { z1z2Pct: 70, z3Pct: 10, z4PlusPct: 20 },
    phaseFocus: {
      base: "Aerobic base, durability, technical skills.",
      build: "Threshold + VO2, race-specific efforts, opener workouts.",
      peak: "Race-specific intervals, openers, skill refresh.",
      taper: "Sharpen with short, hard efforts; arrive rested but primed.",
    },
  },
  "weight-loss": {
    intensity: { z1z2Pct: 85, z3Pct: 10, z4PlusPct: 5 },
    phaseFocus: {
      base: "Volume-led aerobic riding; fuel-for-the-work-required nutrition.",
      build: "Add one tempo session per week; protect easy days.",
      peak: "Maintain volume; one quality session; fuel hard days fully.",
      taper: "Maintain training; the goal is body composition, not peaking.",
    },
  },
  "general-fitness": {
    intensity: { z1z2Pct: 80, z3Pct: 15, z4PlusPct: 5 },
    phaseFocus: {
      base: "Build the habit; mostly easy riding; one sweet-spot effort/week.",
      build: "Add a second quality session; explore new routes.",
      peak: "Steady mix of intensity and volume; enjoy the riding.",
      taper: "No taper required — keep riding consistently.",
    },
  },
};

const EXPERIENCE_RECOVERY_FREQUENCY: Record<TrainingExperience, number> = {
  novice: 3,
  intermediate: 4,
  advanced: 5,
};

export function calculateTrainingPlan(input: TrainingPlanInput): TrainingPlanResult {
  const { goal, ftp, hoursPerWeek, weeks } = input;
  const experience = input.experience ?? "intermediate";
  const profile = GOAL_PROFILE[goal];
  const recoveryEvery = EXPERIENCE_RECOVERY_FREQUENCY[experience];

  // Block periodisation: ~50% base, 30% build, 15% peak, taper takes the
  // remainder so the total always equals the requested weeks. Floors used
  // so peak/build can't steal from taper, and taper has a 1-week minimum
  // (rebalanced from build if needed).
  const minWeeks = Math.max(weeks, 1);
  let baseWeeks = Math.max(1, Math.floor(minWeeks * 0.5));
  let buildWeeks = Math.max(0, Math.floor(minWeeks * 0.3));
  let peakWeeks = Math.max(0, Math.floor(minWeeks * 0.15));
  let taperWeeks = minWeeks - baseWeeks - buildWeeks - peakWeeks;
  if (taperWeeks < 1) {
    const need = 1 - taperWeeks;
    if (buildWeeks >= need) buildWeeks -= need;
    else if (baseWeeks > 1) baseWeeks = Math.max(1, baseWeeks - need);
    taperWeeks = 1;
  }
  // Distribute any extra weeks back into base (longer base is the safest
  // default for any goal).
  const total = baseWeeks + buildWeeks + peakWeeks + taperWeeks;
  if (total < minWeeks) baseWeeks += minWeeks - total;

  const phases = [
    { name: "Base", weeks: baseWeeks, focus: profile.phaseFocus.base },
    { name: "Build", weeks: buildWeeks, focus: profile.phaseFocus.build },
    { name: "Peak", weeks: peakWeeks, focus: profile.phaseFocus.peak },
    { name: "Taper", weeks: taperWeeks, focus: profile.phaseFocus.taper },
  ].filter((p) => p.weeks > 0);

  const weeklyOutlines: TrainingWeekOutline[] = [];
  let weekIndex = 0;
  for (const phase of phases) {
    for (let i = 0; i < phase.weeks; i++) {
      weekIndex++;
      const isRecovery = recoveryEvery > 0 && weekIndex % recoveryEvery === 0;
      const totalHours = isRecovery
        ? Math.round(hoursPerWeek * 0.6 * 10) / 10
        : Math.round(hoursPerWeek * 10) / 10;
      const z1z2Hours = Math.round((totalHours * profile.intensity.z1z2Pct) / 100 * 10) / 10;
      const z3Hours = Math.round((totalHours * profile.intensity.z3Pct) / 100 * 10) / 10;
      const z4PlusHours = Math.round((totalHours * profile.intensity.z4PlusPct) / 100 * 10) / 10;

      const z4MinWatts = Math.round(ftp * 0.91);
      const z4MaxWatts = Math.round(ftp * 1.05);
      const z3MinWatts = Math.round(ftp * 0.76);
      const z3MaxWatts = Math.round(ftp * 0.9);

      const keySessions: string[] = [];
      if (isRecovery) {
        keySessions.push("Recovery week — drop intensity by 40%, hold one short opener.");
      } else if (phase.name === "Base") {
        keySessions.push(`Long Z2 endurance ride: 2-3 hr at ${Math.round(ftp * 0.65)}-${Math.round(ftp * 0.75)} W`);
        keySessions.push(`Sweet-spot intervals: 2 × 20 min at ${Math.round(ftp * 0.88)}-${Math.round(ftp * 0.94)} W`);
      } else if (phase.name === "Build") {
        keySessions.push(`Threshold: 2 × 20 min at ${z4MinWatts}-${z4MaxWatts} W`);
        keySessions.push(`VO2 max: 5 × 4 min at ${Math.round(ftp * 1.1)}-${Math.round(ftp * 1.2)} W, 4 min recovery`);
        keySessions.push(`Z2 long ride: 2.5-3.5 hr aerobic`);
      } else if (phase.name === "Peak") {
        keySessions.push(`Race-specific intervals: 3 × 10 min at ${z4MinWatts}-${z4MaxWatts} W`);
        keySessions.push(`Tempo + surges: 60 min at ${z3MinWatts}-${z3MaxWatts} W with 30-sec efforts every 5 min`);
        keySessions.push(`Long ride with sustained climbs at goal pace`);
      } else {
        keySessions.push(`Opener: 30 min easy with 3 × 1 min at ${z4MinWatts}-${z4MaxWatts} W`);
        keySessions.push(`Short Z2 ride 60-90 min`);
      }

      weeklyOutlines.push({
        week: weekIndex,
        phase: phase.name,
        focus: phase.focus,
        totalHours,
        z1z2Hours,
        z3Hours,
        z4PlusHours,
        keySessions,
      });
    }
  }

  const notes: string[] = [
    `Polarised distribution targeted: ${profile.intensity.z1z2Pct}% Z1-Z2 / ${profile.intensity.z3Pct}% Z3 / ${profile.intensity.z4PlusPct}% Z4+.`,
    `Recovery week every ${recoveryEvery} weeks at 60% of normal hours.`,
    "Watt prescriptions assume the supplied FTP is current. Retest at the end of the build phase.",
    "This is an outline, not a coached plan. Adjust for life stress, travel, and how you actually feel.",
  ];

  return {
    goal,
    weeks: weeklyOutlines.length,
    ftp,
    weeklyAverageHours: Math.round((weeklyOutlines.reduce((s, w) => s + w.totalHours, 0) / weeklyOutlines.length) * 10) / 10,
    intensityDistribution: profile.intensity,
    phases,
    weeklyOutlines,
    notes,
  };
}
// ============================================================
// MASTERS RECOVERY SCORE
// ============================================================

export type RecoverySleep = 1 | 2 | 3 | 4 | 5;
export type RecoveryStress = 1 | 2 | 3 | 4 | 5;
export type RecoveryBand = "critical" | "low" | "compromised" | "good" | "optimal";

export interface MastersRecoveryInput {
  age: number;
  trainingHoursPerWeek: number;
  sleepQuality: RecoverySleep;
  stressLevel: RecoveryStress;
}

export interface MastersRecoveryResult {
  score: number;
  band: RecoveryBand;
  bandLabel: string;
  headline: string;
  recommendation: string;
  topLeverLabel: string;
  topLeverAction: string;
  sustainableHours: number;
  components: {
    age: number;
    load: number;
    sleep: number;
    stress: number;
  };
}

/**
 * Recovery-capacity model for masters cyclists. Combines four inputs
 * into a 0–100 score and a recommendation banded by severity.
 *
 * Heuristic model (no clinical claim) anchored to recurring positions
 * across the Roadman archive: Friel on age and recovery, Seiler on
 * intensity discipline, and the standard masters coaching prescription
 * that sleep and stress are non-negotiable inputs once you cross 40.
 */
export function calculateMastersRecoveryScore(
  input: MastersRecoveryInput,
): MastersRecoveryResult {
  const { age, trainingHoursPerWeek, sleepQuality, stressLevel } = input;

  // Sustainable weekly training load by age. Modeled as a soft decline
  // from ~14 h/week at 40 down to ~9 h/week at 65+, floored at 6.
  const sustainableHours = Math.max(6, 14 - Math.max(0, age - 40) * 0.15);

  // Component penalties (each clamped to a sensible cap).
  const agePenalty = Math.min(25, Math.max(0, (age - 40) * 0.7));

  const loadRatio = sustainableHours > 0 ? trainingHoursPerWeek / sustainableHours : 0;
  const loadPenalty = loadRatio > 1 ? Math.min(30, (loadRatio - 1) * 30) : 0;

  const sleepPenalty = Math.max(0, (5 - sleepQuality) * 6.25);
  const stressPenalty = (stressLevel - 1) * 5;

  const raw = 100 - agePenalty - loadPenalty - sleepPenalty - stressPenalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let band: RecoveryBand;
  let bandLabel: string;
  let headline: string;
  let recommendation: string;
  if (score >= 80) {
    band = "optimal";
    bandLabel = "Optimal";
    headline = "Recovery is your strength right now.";
    recommendation =
      "Hold the line. You can absorb a normal hard week with confidence. If you have a goal event in the next 8–12 weeks this is the window to push an intensity block — sharper VO2max work, race-pace efforts — while the recovery budget is on your side.";
  } else if (score >= 60) {
    band = "good";
    bandLabel = "Good";
    headline = "Solid, but not bulletproof.";
    recommendation =
      "Stay with current training. Treat the next deload week as non-negotiable. The cheapest gain here is usually sleep — even a 30-minute earlier bedtime moves the score meaningfully. Re-test in 10–14 days.";
  } else if (score >= 40) {
    band = "compromised";
    bandLabel = "Compromised";
    headline = "Recovery is the bottleneck.";
    recommendation =
      "Drop one hard session this week. Either skip it or convert it to Zone 2. Address the highest-impact lever below. The masters cyclists who keep gaining are the ones who back off here, not the ones who push through.";
  } else if (score >= 20) {
    band = "low";
    bandLabel = "Low";
    headline = "You're underrecovered.";
    recommendation =
      "Take a 7–10 day deload immediately. 50% of normal volume, no high-intensity work, full rest day every third day. Trying to train through this state typically costs 2–4 weeks of fitness, not adds it. Re-test before you re-introduce hard sessions.";
  } else {
    band = "critical";
    bandLabel = "Critical";
    headline = "Significant risk of overreaching.";
    recommendation =
      "Stop hard training for 10–14 days. Active recovery only — easy spinning, walks, mobility, lifting unloaded. Most masters cyclists reaching this state need three or more weeks before they can absorb structured load again. If symptoms persist (poor sleep, low mood, stalled HRV) consult your GP.";
  }

  // Pick the top fixable lever — the input giving the biggest single
  // penalty — and surface a concrete action for it.
  const levers: { key: "sleep" | "stress" | "load"; value: number }[] = [
    { key: "sleep", value: sleepPenalty },
    { key: "stress", value: stressPenalty },
    { key: "load", value: loadPenalty },
  ];
  levers.sort((a, b) => b.value - a.value);
  const top = levers[0];

  let topLeverLabel: string;
  let topLeverAction: string;
  if (top.value <= 0) {
    topLeverLabel = "Maintain";
    topLeverAction =
      "Nothing to fix — you're managing the controllable variables well. Keep the structure that's getting you here.";
  } else if (top.key === "sleep") {
    topLeverLabel = "Sleep";
    topLeverAction =
      "Sleep is the biggest fixable lever right now. Target 7.5+ hours, consistent wake time, no screens 30 min before bed. If you sleep under 7 hours two nights running, drop the next hard session — don't push through.";
  } else if (top.key === "stress") {
    topLeverLabel = "Life stress";
    topLeverAction =
      "Stress is dragging your score most. Stress and training load are additive — the body doesn't care which one it's recovering from. In a high-stress block, halve the hard sessions, not the volume.";
  } else {
    topLeverLabel = "Training load";
    topLeverAction = `Load is the biggest issue. Your sustainable ceiling at this age is around ${Math.round(sustainableHours)} h/week — you're at ${Math.round(trainingHoursPerWeek)}. Cut volume by ~20% for two weeks, hold the two key intensity sessions, and re-test.`;
  }

  return {
    score,
    band,
    bandLabel,
    headline,
    recommendation,
    topLeverLabel,
    topLeverAction,
    sustainableHours: Math.round(sustainableHours * 10) / 10,
    components: {
      age: Math.round(agePenalty * 10) / 10,
      load: Math.round(loadPenalty * 10) / 10,
      sleep: Math.round(sleepPenalty * 10) / 10,
      stress: Math.round(stressPenalty * 10) / 10,
    },
  };
}

// ============================================================
// MASTERS FTP BENCHMARK
// ============================================================

export type MastersAgeGroup = "40-44" | "45-49" | "50-54" | "55-59" | "60+";
export type MastersFtpGender = "male" | "female";

export interface MastersFtpInput {
  age: number;
  ftp: number;
  weightKg: number;
  gender: MastersFtpGender;
}

export interface MastersFtpResult {
  ageGroup: MastersAgeGroup;
  wkg: number;
  percentile: number;
  cohortLabel: string;
  bandLabel: string;
  headline: string;
  interpretation: string;
  groupMedianWkg: number;
  groupP90Wkg: number;
  watssToNextBand: number | null;
}

interface PercentileAnchors {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

/**
 * Amateur masters cyclist W/kg percentile anchors by age group.
 *
 * Heuristic distribution built from Coggan power profile bands adjusted
 * downwards for amateur (non-professional) populations and the typical
 * masters decline observed across published age-group results
 * (Cyclingnews, BCF, USA Cycling masters categories, Strava aggregate
 * climbing-time data). Treat as a directional benchmark, not a clinical
 * percentile — the goal is to give riders a fair sense of where they
 * sit among trained amateurs in the same decade, not a federation
 * ranking.
 */
const MASTERS_FTP_BENCHMARKS: Record<MastersAgeGroup, Record<MastersFtpGender, PercentileAnchors>> = {
  "40-44": {
    male:   { p10: 1.9, p25: 2.5, p50: 3.1, p75: 3.7, p90: 4.2, p95: 4.5, p99: 5.0 },
    female: { p10: 1.4, p25: 2.0, p50: 2.6, p75: 3.2, p90: 3.7, p95: 4.0, p99: 4.4 },
  },
  "45-49": {
    male:   { p10: 1.8, p25: 2.4, p50: 3.0, p75: 3.5, p90: 4.0, p95: 4.3, p99: 4.7 },
    female: { p10: 1.3, p25: 1.9, p50: 2.5, p75: 3.0, p90: 3.5, p95: 3.8, p99: 4.2 },
  },
  "50-54": {
    male:   { p10: 1.7, p25: 2.2, p50: 2.8, p75: 3.3, p90: 3.8, p95: 4.1, p99: 4.5 },
    female: { p10: 1.2, p25: 1.8, p50: 2.3, p75: 2.8, p90: 3.3, p95: 3.6, p99: 4.0 },
  },
  "55-59": {
    male:   { p10: 1.6, p25: 2.1, p50: 2.6, p75: 3.1, p90: 3.6, p95: 3.9, p99: 4.3 },
    female: { p10: 1.1, p25: 1.6, p50: 2.1, p75: 2.6, p90: 3.1, p95: 3.4, p99: 3.7 },
  },
  "60+": {
    male:   { p10: 1.4, p25: 1.9, p50: 2.4, p75: 2.9, p90: 3.4, p95: 3.7, p99: 4.0 },
    female: { p10: 1.0, p25: 1.5, p50: 2.0, p75: 2.5, p90: 3.0, p95: 3.3, p99: 3.6 },
  },
};

export function getMastersAgeGroup(age: number): MastersAgeGroup {
  if (age < 45) return "40-44";
  if (age < 50) return "45-49";
  if (age < 55) return "50-54";
  if (age < 60) return "55-59";
  return "60+";
}

function interpolatePercentile(wkg: number, anchors: PercentileAnchors): number {
  const points: { p: number; v: number }[] = [
    { p: 1,  v: 0 },
    { p: 10, v: anchors.p10 },
    { p: 25, v: anchors.p25 },
    { p: 50, v: anchors.p50 },
    { p: 75, v: anchors.p75 },
    { p: 90, v: anchors.p90 },
    { p: 95, v: anchors.p95 },
    { p: 99, v: anchors.p99 },
  ];
  if (wkg <= points[0].v) return 1;
  if (wkg >= points[points.length - 1].v) return 99;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (wkg >= a.v && wkg <= b.v) {
      const ratio = b.v === a.v ? 0 : (wkg - a.v) / (b.v - a.v);
      return Math.round(a.p + ratio * (b.p - a.p));
    }
  }
  return 50;
}

export function calculateMastersFtpBenchmark(input: MastersFtpInput): MastersFtpResult {
  const { age, ftp, weightKg, gender } = input;
  const ageGroup = getMastersAgeGroup(age);
  const anchors = MASTERS_FTP_BENCHMARKS[ageGroup][gender];

  const wkg = ftp / weightKg;
  const percentile = interpolatePercentile(wkg, anchors);

  const cohortLabel = `${gender === "male" ? "Male" : "Female"} masters cyclists ${ageGroup}`;

  let bandLabel: string;
  let headline: string;
  let interpretation: string;
  if (percentile >= 95) {
    bandLabel = "Elite masters";
    headline = "You're in the top 5% of masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you sit at the elite end of the masters amateur pool. National-level masters racing is realistic at this number. Power-to-weight at this level is hard-won — protecting it through the 50s and 60s is a strength and recovery problem more than a training problem.`;
  } else if (percentile >= 80) {
    bandLabel = "Strong masters";
    headline = "You're in the top 20% of masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you're a strong masters cyclist. Competitive in regional masters racing and capable of holding your own in club Cat 2 chaingangs. Most riders here have 4–6 hours of structured training plus consistent strength work.`;
  } else if (percentile >= 60) {
    bandLabel = "Above average";
    headline = "You're in the top 40% of masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you're above average for trained masters cyclists. Most riders at this level can move up a band with two changes: more disciplined Zone 2 endurance, and adding (or progressing) heavy strength training twice a week.`;
  } else if (percentile >= 40) {
    bandLabel = "Average masters";
    headline = "You're sitting around the middle of masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you're a typical trained masters cyclist. The biggest unlocks at this point are usually intensity discipline (most masters ride too hard on easy days) and protein adequacy (1.6–2.2 g/kg per day). Both are free.`;
  } else if (percentile >= 20) {
    bandLabel = "Building base";
    headline = "You're in the bottom 40% of trained masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you have meaningful headroom. The fastest gains tend to come from getting the easy rides genuinely easy, adding two true VO2max sessions a week, and starting heavy lower-body strength work. Masters cyclists routinely add 0.3–0.5 W/kg in a year with structured training.`;
  } else {
    bandLabel = "Early masters";
    headline = "You're in the early stages relative to trained masters cyclists in your age group.";
    interpretation = `At ${wkg.toFixed(2)} W/kg you're early in the masters journey. The good news: this is the band where structured training produces the biggest visible gains. The trap is doing too much too soon — start with consistency (4–5 rides a week) and one strength session, then build.`;
  }

  // Watts needed to reach the next anchor (75th if user below 75, else 90th, else 95th, else 99th).
  const targets: { threshold: number; v: number }[] = [
    { threshold: 75, v: anchors.p75 },
    { threshold: 90, v: anchors.p90 },
    { threshold: 95, v: anchors.p95 },
    { threshold: 99, v: anchors.p99 },
  ];
  const next = targets.find((t) => percentile < t.threshold);
  const watssToNextBand = next ? Math.max(1, Math.round(next.v * weightKg - ftp)) : null;

  return {
    ageGroup,
    wkg: Math.round(wkg * 100) / 100,
    percentile,
    cohortLabel,
    bandLabel,
    headline,
    interpretation,
    groupMedianWkg: anchors.p50,
    groupP90Wkg: anchors.p90,
    watssToNextBand,
  };
}

export const MASTERS_AGE_GROUPS: MastersAgeGroup[] = [
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60+",
];
