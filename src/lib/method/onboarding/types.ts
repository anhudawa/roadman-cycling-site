/**
 * Shared types for the Method onboarding quiz + plan recommender.
 *
 * The matrix is goal × weekly-hours × level. Every combination maps to
 * a single TrainingPeaks plan; FTP and target-event are calibration
 * inputs (zones + periodisation timing) but do NOT change the plan
 * selected.
 */

export const GOALS = [
  "gran-fondo",
  "racing",
  "general-fitness",
  "comeback",
] as const;
export type Goal = (typeof GOALS)[number];

export const WEEKLY_HOURS = [6, 8, 10, 12] as const;
export type WeeklyHours = (typeof WEEKLY_HOURS)[number];

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export interface QuizAnswers {
  goal: Goal;
  hours: WeeklyHours;
  level: Level;
  /** Optional. Used to set zones in TrainingPeaks, not to pick the plan. */
  ftp?: number | null;
  /** Optional ISO date (YYYY-MM-DD). Drives the periodisation note. */
  eventDate?: string | null;
}

/** A single entry in the plan matrix. */
export interface PlanEntry {
  /** Stable machine identifier, e.g. `gran-fondo--intermediate--8h`. */
  code: string;
  /** Human-readable plan name, e.g. "Method: Gran Fondo — Intermediate — 8h/wk". */
  name: string;
  goal: Goal;
  hours: WeeklyHours;
  level: Level;
  /** One-sentence summary of the plan. */
  summary: string;
  /** Phase breakdown over 12 weeks, e.g. "Base 4 / Build 5 / Peak 3". */
  structure: string;
  /** Intensity distribution headline, e.g. "Polarised 80/20". */
  intensity: string;
  /** Three bullet points of what's inside. */
  highlights: [string, string, string];
}

export interface Recommendation {
  plan: PlanEntry;
  answers: QuizAnswers;
  /** Calibration notes generated from FTP / event date / unusual combos. */
  notes: string[];
  /** Optional: weeks until target event. Null if no event date provided. */
  weeksToEvent: number | null;
}
