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
