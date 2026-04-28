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

// ---------------------------------------------------------------------------
// Carbs-per-hour
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
