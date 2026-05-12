/**
 * Fuel Planner — Type Definitions
 *
 * Core types for the Roadman Method Fuel Planner calculation engine.
 * Based on the Hexis/Impey FFTWR (Fuel For The Work Required) methodology,
 * verified against live Hexis calculations (May 2026).
 */

/* ------------------------------------------------------------------ */
/*  User Profile                                                       */
/* ------------------------------------------------------------------ */

export type Sex = 'male' | 'female';

export type BodyCompGoal = 'lose' | 'maintain' | 'gain';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface UserProfile {
  sex: Sex;
  age: number; // years
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  bodyCompGoal: BodyCompGoal;
  deficitPct: number; // 0-30, default 15 for lose
  surplusPct: number; // 0-20, default 10 for gain
  ftp: number; // watts
  activityLevel: ActivityLevel;
  /** Custom RMR override (kcal). If not set, Mifflin-St Jeor is used. */
  rmrOverride?: number;
  /** Gross metabolic efficiency, default 0.217 (21.7%) */
  gme?: number;
}

/* ------------------------------------------------------------------ */
/*  Meal Configuration                                                 */
/* ------------------------------------------------------------------ */

export type MealSlot =
  | 'breakfast'
  | 'am_snack'
  | 'lunch'
  | 'pm_snack'
  | 'dinner';

export interface MealConfig {
  slot: MealSlot;
  time: string; // HH:MM format
  enabled: boolean;
}

export interface MealMacros {
  slot: MealSlot;
  time: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  isPreWorkout: boolean;
  isPostWorkout: boolean;
}

/* ------------------------------------------------------------------ */
/*  Training Sessions                                                  */
/* ------------------------------------------------------------------ */

export type FuelCategory =
  | 'REST'
  | 'LOW'
  | 'LOW_MODERATE'
  | 'MODERATE'
  | 'MODERATE_HIGH'
  | 'HIGH'
  | 'VERY_HIGH';

export interface TrainingSession {
  /** Session name from TrainingPeaks plan */
  name: string;
  /** Duration in minutes */
  durationMin: number;
  /** Intensity Factor from TP (0.0-1.2+) */
  intensityFactor: number;
  /** Fuel category for carb scaling */
  fuelCategory: FuelCategory;
  /** Start time HH:MM */
  startTime: string;
  /** Whether this is a competition/race day */
  isCompetition: boolean;
}

/* ------------------------------------------------------------------ */
/*  Day Plan                                                           */
/* ------------------------------------------------------------------ */

export interface DayPlan {
  date: string; // ISO date YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 1=Mon...
  session: TrainingSession | null;
  meals: MealMacros[];
  totals: DayTotals;
  weekNumber: number; // 1-12 in the course
  mesocycleWeek: number; // 1-4 within the mesocycle
  isRecoveryWeek: boolean;
}

export interface DayTotals {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  exerciseKj: number;
  exerciseKcal: number;
  /** In-ride carb target g/hr */
  inRideCarbsGPerHr: number;
}

/* ------------------------------------------------------------------ */
/*  Week & Calendar                                                    */
/* ------------------------------------------------------------------ */

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  days: DayPlan[];
  weeklyTotals: {
    calories: number;
    carbsG: number;
    proteinG: number;
    fatG: number;
    trainingHours: number;
    exerciseKcal: number;
  };
  isRecoveryWeek: boolean;
  phase: TrainingPhase;
}

export type TrainingPhase =
  | 'base'
  | 'vo2'
  | 'threshold'
  | 'race_specific'
  | 'taper';

export interface FuelCalendar {
  weeks: WeekPlan[];
  profile: UserProfile;
  mealConfig: MealConfig[];
}

/* ------------------------------------------------------------------ */
/*  Session Library Types                                              */
/* ------------------------------------------------------------------ */

export interface SessionTemplate {
  id: string;
  name: string;
  /** Base duration in minutes (can be scaled per hour-band) */
  baseDurationMin: number;
  /** Typical IF from TP data */
  typicalIF: number;
  fuelCategory: FuelCategory;
  description: string;
  /** Suggested in-ride carbs g/hr for this session type */
  suggestedInRideCarbsGPerHr: number;
}
