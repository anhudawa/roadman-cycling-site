/**
 * Fuel Planner — Public API
 *
 * The Roadman Method Fuel Planner: a prescription-based nutrition tool
 * that tells users what to eat, meal by meal, based on their planned
 * training. Built on the Hexis/Impey FFTWR methodology.
 *
 * Usage:
 *   import { calculateDailyMacros, generateDayPlan, SESSION_TEMPLATES } from '@/lib/fuel-planner';
 */

// Types
export type {
  UserProfile,
  MealConfig,
  MealMacros,
  MealSlot,
  TrainingSession,
  DayPlan,
  DayTotals,
  WeekPlan,
  FuelCalendar,
  FuelCategory,
  SessionTemplate,
  Sex,
  BodyCompGoal,
  ActivityLevel,
  TrainingPhase,
} from './types';

// Engine functions
export {
  estimateRMR,
  calculateBaseTDEE,
  applyGoal,
  calculateExerciseEnergy,
  calculateRestoredCalories,
  calculateProtein,
  calculateDailyMacros,
  distributeMeals,
  generateDayPlan,
} from './engine';

export type { DailyMacros } from './engine';

// Session library
export {
  SESSION_TEMPLATES,
  IN_RIDE_CARBS_BY_CATEGORY,
  getSessionTemplate,
  getSessionsByCategory,
} from './sessions';

// Calendar generation
export {
  generateCalendar,
  generateWeek,
  patternEntryToSession,
  startOfWeekMonday,
  findWeekIndex,
  DEFAULT_WEEK_PATTERN,
  DEFAULT_MEAL_CONFIG,
  REST_ENTRY,
  DAY_LABELS,
  DAY_LABELS_LONG,
} from './calendar';
export type {
  WeekPattern,
  WeekPatternEntry,
  DayIndex,
  CalendarOptions,
} from './calendar';
