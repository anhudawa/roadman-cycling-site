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
