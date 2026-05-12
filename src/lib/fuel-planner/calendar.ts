/**
 * Fuel Planner — Calendar generation.
 *
 * Wraps the engine to produce multi-week plans from a profile + a
 * weekly session pattern (Mon–Sun template ids) + a start date.
 */

import { generateDayPlan } from './engine';
import { getSessionTemplate } from './sessions';
import type {
  DayPlan,
  MealConfig,
  TrainingSession,
  UserProfile,
  WeekPlan,
} from './types';

/* ------------------------------------------------------------------ */
/*  Weekly pattern                                                     */
/* ------------------------------------------------------------------ */

/** Day index 0..6 = Monday..Sunday (week starts Monday). */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: readonly string[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const;

export const DAY_LABELS_LONG: readonly string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface WeekPatternEntry {
  /** Session template id, or `null` for a rest day. */
  templateId: string | null;
  /** Start time HH:MM. Defaults applied when missing. */
  startTime?: string;
  /** Override duration in minutes. Falls back to template baseDuration. */
  durationMin?: number;
  /** Override IF. Falls back to template typicalIF. */
  intensityFactor?: number;
  /** Mark this day as a competition (boosts restoration + adds carb load). */
  isCompetition?: boolean;
}

/** Mon..Sun, length 7. */
export type WeekPattern = readonly [
  WeekPatternEntry,
  WeekPatternEntry,
  WeekPatternEntry,
  WeekPatternEntry,
  WeekPatternEntry,
  WeekPatternEntry,
  WeekPatternEntry,
];

export const REST_ENTRY: WeekPatternEntry = { templateId: null };

/** Sensible default — one solid weekend long ride, two threshold blocks, two easy days, two rest. */
export const DEFAULT_WEEK_PATTERN: WeekPattern = [
  { templateId: null }, // Mon — rest
  { templateId: '4x5_threshold', startTime: '17:30' }, // Tue — threshold
  { templateId: 'z2_endurance_short', startTime: '17:30' }, // Wed — Z2
  { templateId: '5x2_vo2', startTime: '17:30' }, // Thu — VO2
  { templateId: null }, // Fri — rest
  { templateId: 'endurance_micro_sprints', startTime: '09:00' }, // Sat — long
  { templateId: 'z2_endurance_long', startTime: '09:00' }, // Sun — endurance
] as const;

/** Default meal configuration — five meals matching Hexis defaults. */
export const DEFAULT_MEAL_CONFIG: MealConfig[] = [
  { slot: 'breakfast', time: '07:30', enabled: true },
  { slot: 'am_snack', time: '10:30', enabled: false },
  { slot: 'lunch', time: '12:30', enabled: true },
  { slot: 'pm_snack', time: '16:00', enabled: true },
  { slot: 'dinner', time: '19:30', enabled: true },
];

/* ------------------------------------------------------------------ */
/*  Pattern → TrainingSession                                          */
/* ------------------------------------------------------------------ */

/** Default start times if pattern doesn't specify. */
const DEFAULT_START_BY_DAY: Record<DayIndex, string> = {
  0: '17:30', // Mon
  1: '17:30', // Tue
  2: '17:30', // Wed
  3: '17:30', // Thu
  4: '17:30', // Fri
  5: '09:00', // Sat
  6: '09:00', // Sun
};

export function patternEntryToSession(
  entry: WeekPatternEntry,
  dayIndex: DayIndex,
): TrainingSession | null {
  if (!entry.templateId) return null;
  const tpl = getSessionTemplate(entry.templateId);
  if (!tpl) return null;

  return {
    name: tpl.name,
    durationMin: entry.durationMin ?? tpl.baseDurationMin,
    intensityFactor: entry.intensityFactor ?? tpl.typicalIF,
    fuelCategory: tpl.fuelCategory,
    startTime: entry.startTime ?? DEFAULT_START_BY_DAY[dayIndex],
    isCompetition: entry.isCompetition ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

/** Parse YYYY-MM-DD as a UTC midnight Date (no TZ ambiguity). */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function formatISODate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Find the Monday on/before the given ISO date. */
export function startOfWeekMonday(iso: string): string {
  const d = parseISODate(iso);
  // getUTCDay: 0=Sun..6=Sat. We want days back to reach Mon (=1).
  const dow = d.getUTCDay(); // 0..6
  const offsetFromMon = (dow + 6) % 7; // Mon=0, Tue=1, ... Sun=6
  d.setUTCDate(d.getUTCDate() - offsetFromMon);
  return formatISODate(d);
}

function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatISODate(d);
}

/* ------------------------------------------------------------------ */
/*  Calendar generation                                                */
/* ------------------------------------------------------------------ */

export interface CalendarOptions {
  /** ISO date (YYYY-MM-DD) — week start (Monday) for week 1. */
  startDate: string;
  /** Total weeks to generate. Default 12. */
  numWeeks?: number;
  /** Index of the recovery week within each 4-week mesocycle (0-based). Default 3 (= 4th week). */
  recoveryWeekInMesocycle?: number;
  /** Optional per-week overrides keyed by 1-based week number. */
  weekOverrides?: Record<number, Partial<WeekPattern>>;
}

/**
 * Generate a single week of plans applying the pattern to consecutive days.
 */
export function generateWeek(
  weekStartISO: string,
  weekNumber: number,
  pattern: WeekPattern,
  profile: UserProfile,
  meals: MealConfig[],
  isRecoveryWeek: boolean,
): WeekPlan {
  const days: DayPlan[] = [];
  const mesocycleWeek = ((weekNumber - 1) % 4) + 1;

  for (let i = 0; i < 7; i++) {
    const dayIndex = i as DayIndex;
    const date = addDays(weekStartISO, i);
    const entry = pattern[dayIndex];
    let session = patternEntryToSession(entry, dayIndex);

    // Recovery week: scale duration to 60% on training days.
    if (isRecoveryWeek && session) {
      session = {
        ...session,
        durationMin: Math.round(session.durationMin * 0.6),
      };
    }

    days.push(
      generateDayPlan(
        date,
        profile,
        meals,
        session,
        weekNumber,
        mesocycleWeek,
        isRecoveryWeek,
      ),
    );
  }

  const weeklyTotals = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.totals.calories,
      carbsG: acc.carbsG + d.totals.carbsG,
      proteinG: acc.proteinG + d.totals.proteinG,
      fatG: acc.fatG + d.totals.fatG,
      trainingHours: acc.trainingHours + (d.session?.durationMin ?? 0) / 60,
      exerciseKcal: acc.exerciseKcal + d.totals.exerciseKcal,
    }),
    {
      calories: 0,
      carbsG: 0,
      proteinG: 0,
      fatG: 0,
      trainingHours: 0,
      exerciseKcal: 0,
    },
  );

  return {
    weekNumber,
    startDate: weekStartISO,
    days,
    weeklyTotals: {
      ...weeklyTotals,
      trainingHours: Math.round(weeklyTotals.trainingHours * 10) / 10,
    },
    isRecoveryWeek,
    phase: phaseForWeek(weekNumber),
  };
}

/**
 * Generate N weeks starting from `opts.startDate`.
 */
export function generateCalendar(
  profile: UserProfile,
  pattern: WeekPattern,
  meals: MealConfig[],
  opts: CalendarOptions,
): WeekPlan[] {
  const numWeeks = opts.numWeeks ?? 12;
  const recoveryIdx = opts.recoveryWeekInMesocycle ?? 3;
  const weeks: WeekPlan[] = [];
  const startMonday = startOfWeekMonday(opts.startDate);

  for (let w = 1; w <= numWeeks; w++) {
    const weekStart = addDays(startMonday, (w - 1) * 7);
    const isRecovery = (w - 1) % 4 === recoveryIdx;
    weeks.push(
      generateWeek(weekStart, w, pattern, profile, meals, isRecovery),
    );
  }

  return weeks;
}

/** Map week number → training phase. Mirrors method-architecture phase grid (12-week base). */
function phaseForWeek(weekNumber: number): WeekPlan['phase'] {
  if (weekNumber <= 4) return 'base';
  if (weekNumber <= 6) return 'threshold';
  if (weekNumber <= 8) return 'vo2';
  if (weekNumber <= 10) return 'race_specific';
  return 'taper';
}

/** Get the week index containing the given ISO date, or -1 if out of range. */
export function findWeekIndex(weeks: WeekPlan[], iso: string): number {
  const target = parseISODate(iso).getTime();
  return weeks.findIndex((w) => {
    const start = parseISODate(w.startDate).getTime();
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return target >= start && target < end;
  });
}
