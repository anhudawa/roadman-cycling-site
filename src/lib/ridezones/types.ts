/**
 * RideZones domain types.
 *
 * RideZones turns a rider's historical ride data into a fitness profile,
 * per-session execution feedback, a "race recipe" (what their best block
 * was made of), and a goal-specific training week. All engine code in
 * this directory is pure and side-effect free — the interactive app under
 * /ridezones/app owns persistence and I/O.
 */

export type GoalKey =
  | "gran-fondo"
  | "road-race"
  | "ftp-breakthrough"
  | "base-season";

export interface RiderSettings {
  /** Functional threshold power, watts. */
  ftp: number;
  /** Lactate threshold heart rate, bpm. Enables HR fallback for rides without power. */
  lthr?: number;
  weightKg?: number;
  /** Hours the rider can realistically train per week. */
  weeklyHours: number;
  goal: GoalKey;
}

export type ActivitySource = "strava" | "demo" | "manual";

export interface Activity {
  id: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  name: string;
  /** Moving time in seconds. */
  durationSec: number;
  distanceKm?: number;
  avgPower?: number;
  normalizedPower?: number;
  avgHr?: number;
  elevationM?: number;
  /**
   * Seconds spent in each of the 7 Coggan power zones (index 0 = Z1).
   * Present on demo data and rich imports; summary-only imports omit it
   * and the engine falls back to intensity-factor heuristics.
   */
  zoneTimesSec?: number[];
  source: ActivitySource;
}

/** What a ride was, read from the data — not what the rider hoped it was. */
export type SessionPurpose =
  | "recovery"
  | "endurance"
  | "long-ride"
  | "grey-zone"
  | "tempo"
  | "sweet-spot"
  | "threshold"
  | "vo2"
  | "unknown";

export type LoadSource = "power" | "hr" | "duration";

export interface ExecutionScore {
  /** 0–10, one decimal place. */
  score: number;
  verdict: "nailed" | "solid" | "drifted" | "missed";
  /** One or two sentences of coach feedback. */
  note: string;
}

export interface AnalyzedActivity extends Activity {
  tss: number;
  /** NP/FTP (or the HR-derived equivalent). Null when only duration was available. */
  intensityFactor: number | null;
  loadSource: LoadSource;
  purpose: SessionPurpose;
  execution: ExecutionScore | null;
}

/** One point per calendar day on the performance-management timeline. */
export interface LoadPoint {
  date: string;
  tss: number;
  /** Chronic training load — 42-day exponentially weighted TSS. "Fitness". */
  ctl: number;
  /** Acute training load — 7-day exponentially weighted TSS. "Fatigue". */
  atl: number;
  /** Training stress balance (yesterday's CTL − ATL). "Form". */
  tsb: number;
}

export type SystemKey =
  | "aerobic-base"
  | "zone2-engine"
  | "easy-discipline"
  | "tempo-control"
  | "threshold-power"
  | "vo2-engine"
  | "durability"
  | "execution-quality";

export type SystemState = "strong" | "developing" | "underdeveloped" | "unknown";

export interface SystemScore {
  key: SystemKey;
  label: string;
  /** 0–100. */
  score: number;
  state: SystemState;
  note: string;
}

export interface ProfileFocus {
  system: SystemKey;
  headline: string;
  coachNote: string;
}

export interface FitnessProfile {
  systems: SystemScore[];
  focus: ProfileFocus;
  /** ISO date the profile was computed for. */
  asOf: string;
}

export interface BlockSummary {
  startDate: string;
  endDate: string;
  weeklyHours: number;
  weeklyTss: number;
  longestRideHours: number;
  avgLongRideHours: number;
  /** Share of riding time at endurance intensity or below (0–1). */
  easyShare: number;
  /** Threshold/sweet-spot/VO2 sessions per week. */
  keySessionsPerWeek: number;
  ctlGain: number;
  endTsb: number;
  rideCount: number;
}

export type GapSeverity = "major" | "minor" | "ok";

export interface RecipeGap {
  key: string;
  label: string;
  bestValue: string;
  currentValue: string;
  severity: GapSeverity;
  note: string;
}

export interface RaceRecipe {
  /** Null when there isn't enough history to name a best block. */
  best: BlockSummary | null;
  current: BlockSummary | null;
  gaps: RecipeGap[];
  headline: string;
}

export interface SessionTarget {
  kind: "power" | "hr" | "cadence" | "rpe";
  text: string;
}

export interface PlannedSession {
  id: string;
  /** Mon–Sun. */
  day: string;
  title: string;
  purpose: SessionPurpose;
  durationMin: number;
  structure: string;
  targets: SessionTarget[];
  whyItWorks: string;
  preRideAdvice: string;
  /** Named coach/researcher the session traces back to, when there is one. */
  expertRef?: string;
}

export interface WeekPlan {
  goal: GoalKey;
  focusSystem: SystemKey;
  sessions: PlannedSession[];
  weekNote: string;
  totalHours: number;
}

/** Everything the dashboard needs, computed in one pass. */
export interface RideZonesAnalysis {
  settings: RiderSettings;
  activities: AnalyzedActivity[];
  load: LoadPoint[];
  profile: FitnessProfile;
  recipe: RaceRecipe;
  plan: WeekPlan;
  asOf: string;
}
