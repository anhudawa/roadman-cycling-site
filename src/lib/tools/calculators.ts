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
