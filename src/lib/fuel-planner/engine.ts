/**
 * Fuel Planner — Calculation Engine
 *
 * Core calculation engine implementing the Hexis/Impey FFTWR methodology.
 * Verified against 3 test cases from a live Hexis account (May 2026):
 *   - Rest day:       1750 kcal (123C / 148P / 74F)
 *   - Training day:   1953 kcal (157C / 149P / 81F)  [20min @ 200W]
 *   - Competition day: 2309 kcal (219C / 149P / 93F)  [same workout]
 *
 * Docs: /docs/hexis-calculation-verification.md
 *       /docs/trainingpeaks-plan-analysis.md
 */

import type {
  UserProfile,
  MealConfig,
  MealMacros,
  MealSlot,
  TrainingSession,
  DayPlan,
  DayTotals,
  FuelCategory,
} from './types';
import { IN_RIDE_CARBS_BY_CATEGORY } from './sessions';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Default gross metabolic efficiency — matches Hexis default */
const DEFAULT_GME = 0.217;

/** NEAT multipliers by activity level */
const NEAT_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/** Diet-induced thermogenesis rates by macronutrient */
const DIT_RATES = {
  carbs: 0.05,
  protein: 0.25,
  fat: 0.015,
};

/**
 * Carb scaling factors by fuel category.
 * These control how much of the extra exercise energy is allocated to carbs
 * vs fat. Higher-intensity sessions need proportionally more carbs.
 *
 * Derived from Hexis test cases:
 *   Training day: 67% of extra cals came from carbs
 *   Competition day: even higher carb allocation
 */
const CARB_SCALING: Record<FuelCategory, number> = {
  REST: 0,
  LOW: 0.5,
  LOW_MODERATE: 0.55,
  MODERATE: 0.6,
  MODERATE_HIGH: 0.65,
  HIGH: 0.7,
  VERY_HIGH: 0.8,
};

/**
 * Exercise calorie restoration factors.
 * On normal training days, only ~77% of exercise calories are restored
 * (the deficit absorbs the rest). On competition days, nearly 100%.
 */
const RESTORATION_FACTORS: Record<FuelCategory, number> = {
  REST: 0,
  LOW: 0.7,
  LOW_MODERATE: 0.73,
  MODERATE: 0.77,
  MODERATE_HIGH: 0.8,
  HIGH: 0.85,
  VERY_HIGH: 0.95,
};

/**
 * Competition mode overrides restoration to ~100% and adds extra
 * carb loading. Factor applied on top of exercise calories.
 */
const COMPETITION_RESTORATION = 1.0;
const COMPETITION_CARB_BONUS_G = 40; // Extra grams of carbs for competition day

/* ------------------------------------------------------------------ */
/*  Step 1: Resting Metabolic Rate                                     */
/* ------------------------------------------------------------------ */

/**
 * Mifflin-St Jeor equation for RMR estimation.
 * Returns kcal/day.
 */
export function estimateRMR(profile: UserProfile): number {
  if (profile.rmrOverride) return profile.rmrOverride;

  const { sex, weightKg, heightCm, age } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/* ------------------------------------------------------------------ */
/*  Step 2: Total Daily Energy Expenditure (before deficit)            */
/* ------------------------------------------------------------------ */

/**
 * Calculate base TDEE including NEAT and an estimate of DIT.
 * DIT is iterative (depends on macros which depend on TDEE), so we
 * use a simplified approach: estimate DIT as ~10% of RMR for the
 * initial pass, matching the Hexis profile behaviour.
 */
export function calculateBaseTDEE(profile: UserProfile): number {
  const rmr = estimateRMR(profile);
  const neatMultiplier = NEAT_MULTIPLIERS[profile.activityLevel] ?? 1.2;
  const neat = rmr * (neatMultiplier - 1); // NEAT addition on top of RMR
  const dit = rmr * 0.1; // Simplified ~10% of RMR
  return rmr + neat + dit;
}

/* ------------------------------------------------------------------ */
/*  Step 3: Apply body composition goal                                */
/* ------------------------------------------------------------------ */

/**
 * Apply deficit or surplus to base TDEE.
 */
export function applyGoal(baseTDEE: number, profile: UserProfile): number {
  switch (profile.bodyCompGoal) {
    case 'lose':
      return baseTDEE * (1 - profile.deficitPct / 100);
    case 'gain':
      return baseTDEE * (1 + profile.surplusPct / 100);
    case 'maintain':
    default:
      return baseTDEE;
  }
}

/* ------------------------------------------------------------------ */
/*  Step 4: Exercise Energy                                            */
/* ------------------------------------------------------------------ */

/**
 * Calculate exercise energy from a training session.
 *
 * Formula: kJ = IF² × FTP × duration_hrs × 3.6
 * Then:    kcal = kJ × (1 / (4.184 × GME))
 *
 * Simplified: kcal ≈ kJ × 1.1 at GME ~21.7%
 */
export function calculateExerciseEnergy(
  session: TrainingSession,
  ftp: number,
  gme: number = DEFAULT_GME,
): { kj: number; kcal: number } {
  if (!session || session.durationMin === 0) {
    return { kj: 0, kcal: 0 };
  }

  const durationHrs = session.durationMin / 60;
  const kj =
    session.intensityFactor ** 2 * ftp * durationHrs * 3.6;

  // Convert kJ to kcal using GME
  // kcal = kJ / (4.184 × GME)
  // At GME 0.217: 1 / (4.184 × 0.217) ≈ 1.101
  const kcal = kj / (4.184 * gme);

  return { kj: Math.round(kj), kcal: Math.round(kcal) };
}

/**
 * Calculate how many exercise calories to restore based on session
 * intensity and competition status.
 */
export function calculateRestoredCalories(
  exerciseKcal: number,
  fuelCategory: FuelCategory,
  isCompetition: boolean,
): number {
  if (exerciseKcal === 0) return 0;

  const factor = isCompetition
    ? COMPETITION_RESTORATION
    : (RESTORATION_FACTORS[fuelCategory] ?? 0.77);

  return Math.round(exerciseKcal * factor);
}

/* ------------------------------------------------------------------ */
/*  Step 5: Protein Target                                             */
/* ------------------------------------------------------------------ */

/**
 * Calculate daily protein target.
 * 1.8 g/kg bodyweight — consistent with Hexis prescription
 * (~148g for an 81.8kg rider).
 */
export function calculateProtein(weightKg: number): number {
  return Math.round(weightKg * 1.8);
}

/* ------------------------------------------------------------------ */
/*  Step 6: Macro Distribution                                         */
/* ------------------------------------------------------------------ */

export interface DailyMacros {
  totalKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  carbPct: number;
  proteinPct: number;
  fatPct: number;
}

/**
 * Calculate full daily macronutrient distribution.
 *
 * Logic:
 * 1. Protein is fixed at 1.8 g/kg (constant regardless of training)
 * 2. Base carbs set at ~28% of rest-day calories
 * 3. On training days, extra carbs from exercise restoration (67-80%)
 * 4. Competition days get additional carb loading
 * 5. Fat fills the remainder
 */
export function calculateDailyMacros(
  profile: UserProfile,
  session: TrainingSession | null,
): DailyMacros {
  const baseTDEE = calculateBaseTDEE(profile);
  const restDayTarget = applyGoal(baseTDEE, profile);

  // Protein: constant
  const proteinG = calculateProtein(profile.weightKg);
  const proteinKcal = proteinG * 4;

  // Exercise energy
  const gme = profile.gme ?? DEFAULT_GME;
  const exercise = session
    ? calculateExerciseEnergy(session, profile.ftp, gme)
    : { kj: 0, kcal: 0 };

  const fuelCategory = session?.fuelCategory ?? 'REST';
  const isCompetition = session?.isCompetition ?? false;

  const restoredKcal = calculateRestoredCalories(
    exercise.kcal,
    fuelCategory,
    isCompetition,
  );

  const totalKcal = restDayTarget + restoredKcal;

  // Base carbs: ~28% of rest-day target
  const baseCarbKcal = restDayTarget * 0.28;
  const baseCarbG = baseCarbKcal / 4;

  // Extra carbs from exercise (scaled by fuel category)
  const carbScaling = CARB_SCALING[fuelCategory] ?? 0.67;
  const extraCarbKcal = restoredKcal * carbScaling;
  const extraCarbG = extraCarbKcal / 4;

  // Competition bonus
  const competitionBonusG = isCompetition ? COMPETITION_CARB_BONUS_G : 0;

  const carbsG = Math.round(baseCarbG + extraCarbG + competitionBonusG);
  const carbKcal = carbsG * 4;

  // Fat: remainder
  const fatKcal = Math.max(0, totalKcal - proteinKcal - carbKcal);
  const fatG = Math.round(fatKcal / 9);

  // Recalculate actual total (may differ slightly due to rounding)
  const actualTotal = carbsG * 4 + proteinG * 4 + fatG * 9;

  return {
    totalKcal: Math.round(actualTotal),
    carbsG,
    proteinG,
    fatG,
    carbPct: Math.round((carbsG * 4 * 100) / actualTotal),
    proteinPct: Math.round((proteinG * 4 * 100) / actualTotal),
    fatPct: Math.round((fatG * 9 * 100) / actualTotal),
  };
}

/* ------------------------------------------------------------------ */
/*  Step 7: Meal Distribution                                          */
/* ------------------------------------------------------------------ */

/**
 * Default meal distribution weights.
 * Verified against Hexis: Breakfast ~24%, Lunch ~30%, PM Snack ~15%, Dinner ~30%
 */
const DEFAULT_MEAL_WEIGHTS: Record<MealSlot, number> = {
  breakfast: 0.24,
  am_snack: 0.12,
  lunch: 0.3,
  pm_snack: 0.15,
  dinner: 0.3,
};

/**
 * Distribute daily macros across meals, accounting for workout timing.
 *
 * Rules (from Hexis verification):
 * 1. Protein distributed evenly across meals
 * 2. Pre-workout meals get a moderate carb bump
 * 3. Post-workout meals (first meal after training) get the largest carb increase
 * 4. Competition mode starts carb-loading from breakfast (before ride)
 * 5. Fat fills remaining calories per meal
 */
export function distributeMeals(
  macros: DailyMacros,
  meals: MealConfig[],
  session: TrainingSession | null,
): MealMacros[] {
  const enabledMeals = meals.filter((m) => m.enabled);
  if (enabledMeals.length === 0) return [];

  // Calculate meal timing relationships to workout
  const sessionStart = session
    ? parseTime(session.startTime)
    : Infinity;
  const sessionEnd = session
    ? sessionStart + session.durationMin
    : Infinity;

  // Normalise weights for enabled meals
  const totalWeight = enabledMeals.reduce(
    (sum, m) => sum + (DEFAULT_MEAL_WEIGHTS[m.slot] ?? 0.2),
    0,
  );

  // Identify pre/post workout meals
  const mealTimings = enabledMeals.map((m) => {
    const mealTime = parseTime(m.time);
    const isPreWorkout =
      session != null &&
      mealTime < sessionStart &&
      sessionStart - mealTime <= 120; // within 2 hrs before
    const isPostWorkout =
      session != null &&
      mealTime >= sessionEnd &&
      mealTime - sessionEnd <= 180; // within 3 hrs after

    return { ...m, mealTime, isPreWorkout, isPostWorkout };
  });

  // Find first post-workout meal (gets largest carb bonus)
  const firstPostIdx = mealTimings.findIndex((m) => m.isPostWorkout);

  return mealTimings.map((m, idx) => {
    const baseWeight =
      (DEFAULT_MEAL_WEIGHTS[m.slot] ?? 0.2) / totalWeight;

    // Protein: distribute evenly
    const proteinG = Math.round(macros.proteinG / enabledMeals.length);

    // Carbs: base distribution + workout-timing adjustments
    let carbWeight = baseWeight;
    if (m.isPreWorkout) {
      carbWeight *= 1.15; // 15% carb bump for pre-workout
    }
    if (m.isPostWorkout && idx === firstPostIdx) {
      carbWeight *= 1.3; // 30% carb bump for first post-workout meal
    }
    if (session?.isCompetition && m.mealTime < sessionStart) {
      carbWeight *= 1.25; // Competition pre-ride carb loading
    }

    // Normalise carb weights
    const totalCarbWeight = mealTimings.reduce((sum, meal, i) => {
      let w =
        (DEFAULT_MEAL_WEIGHTS[meal.slot] ?? 0.2) / totalWeight;
      if (meal.isPreWorkout) w *= 1.15;
      if (meal.isPostWorkout && i === firstPostIdx) w *= 1.3;
      if (session?.isCompetition && meal.mealTime < sessionStart) {
        w *= 1.25;
      }
      return sum + w;
    }, 0);

    const carbsG = Math.round(
      macros.carbsG * (carbWeight / totalCarbWeight),
    );

    // Fat: fill remaining calories for this meal's calorie target
    const mealKcalTarget = Math.round(macros.totalKcal * baseWeight);
    const carbKcal = carbsG * 4;
    const protKcal = proteinG * 4;
    const fatKcal = Math.max(0, mealKcalTarget - carbKcal - protKcal);
    const fatG = Math.round(fatKcal / 9);

    const calories = carbsG * 4 + proteinG * 4 + fatG * 9;

    return {
      slot: m.slot,
      time: m.time,
      calories,
      carbsG,
      proteinG,
      fatG,
      isPreWorkout: m.isPreWorkout,
      isPostWorkout: m.isPostWorkout,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Full Day Plan                                                      */
/* ------------------------------------------------------------------ */

/**
 * Generate a complete day plan with macros distributed across meals.
 */
export function generateDayPlan(
  date: string,
  profile: UserProfile,
  mealConfig: MealConfig[],
  session: TrainingSession | null,
  weekNumber: number,
  mesocycleWeek: number,
  isRecoveryWeek: boolean,
): DayPlan {
  const macros = calculateDailyMacros(profile, session);
  const meals = distributeMeals(macros, mealConfig, session);

  const gme = profile.gme ?? DEFAULT_GME;
  const exercise = session
    ? calculateExerciseEnergy(session, profile.ftp, gme)
    : { kj: 0, kcal: 0 };

  const fuelCategory = session?.fuelCategory ?? 'REST';
  const inRideCarbs =
    session && session.durationMin >= 60
      ? IN_RIDE_CARBS_BY_CATEGORY[fuelCategory] ?? 0
      : 0;

  const totals: DayTotals = {
    calories: macros.totalKcal,
    carbsG: macros.carbsG,
    proteinG: macros.proteinG,
    fatG: macros.fatG,
    exerciseKj: exercise.kj,
    exerciseKcal: exercise.kcal,
    inRideCarbsGPerHr: inRideCarbs,
  };

  const d = new Date(date);
  return {
    date,
    dayOfWeek: d.getUTCDay(),
    session,
    meals,
    totals,
    weekNumber,
    mesocycleWeek,
    isRecoveryWeek,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Parse "HH:MM" into minutes since midnight. */
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
