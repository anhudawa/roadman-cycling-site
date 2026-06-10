/**
 * Fuel Planner — Competition carb-load protocol.
 *
 * The base FFTWR engine periodises carbohydrate day-to-day. A race is a
 * different problem: you want glycogen stores maxed out going in. This
 * module layers the Impey 48-hour carbohydrate-loading sequence on top of
 * the daily macros — it does NOT replace the verified Hexis engine.
 *
 * Protocol (Impey, building on Morton's "fuel for the work required"):
 *   48h out — 8 g/kg, training tapered to an easy spin or rest
 *   24h out — 10 g/kg, rest or short race openers only
 *   Race day — 12 g/kg ceiling across the day, race fuelling on the bike
 *
 * The 8–12 g/kg range and the taper are the two halves of the same
 * sequence — a per-day "race" toggle alone can't express it, which is why
 * the annotation reaches back across the two lead-in days.
 *
 * Docs: /docs/hexis-calculation-verification.md
 */

import type { CarbLoadAnnotation, CarbLoadStageKind, WeekPlan } from './types';

export interface CarbLoadStage {
  /** Days relative to the race: -2, -1, 0. */
  offset: number;
  stage: CarbLoadStageKind;
  /** Short label shown in the UI. */
  label: string;
  /** Carbohydrate target in g per kg bodyweight. */
  gPerKg: number;
  /** Training / taper instruction for the day. */
  trainingNote: string;
}

/**
 * The Impey 48-hour carb-load + taper sequence.
 * Ordered earliest-first (48h out → race day).
 */
export const IMPEY_CARB_LOAD_SEQUENCE: readonly CarbLoadStage[] = [
  {
    offset: -2,
    stage: 'load',
    label: '48h out',
    gPerKg: 8,
    trainingNote:
      'Carb-load begins — drop training to an easy spin or take it off. Spread carbs across every meal.',
  },
  {
    offset: -1,
    stage: 'peak',
    label: '24h out',
    gPerKg: 10,
    trainingNote:
      'Peak load — rest or short race openers only. Favour low-fibre, low-fat carb sources to stay comfortable.',
  },
  {
    offset: 0,
    stage: 'race',
    label: 'Race day',
    gPerKg: 12,
    trainingNote:
      'Race fuelling — pre-race meal 3–4h out, then carbs on the bike at the in-ride target.',
  },
] as const;

/** Absolute carbohydrate target (g) for a given bodyweight and g/kg rate. */
export function carbLoadTargetG(weightKg: number, gPerKg: number): number {
  return Math.round(weightKg * gPerKg);
}

/* ------------------------------------------------------------------ */
/*  Date helpers (UTC, mirroring calendar.ts)                          */
/* ------------------------------------------------------------------ */

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

function shiftISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatISODate(d);
}

/* ------------------------------------------------------------------ */
/*  Protocol application                                               */
/* ------------------------------------------------------------------ */

/**
 * Build the carb-load annotation for a single stage and rider weight.
 */
export function buildAnnotation(
  stage: CarbLoadStage,
  weightKg: number,
  raceDate: string,
): CarbLoadAnnotation {
  return {
    stage: stage.stage,
    label: stage.label,
    gPerKg: stage.gPerKg,
    targetCarbsG: carbLoadTargetG(weightKg, stage.gPerKg),
    trainingNote: stage.trainingNote,
    raceDate,
  };
}

/**
 * Annotate the days of a generated calendar with the Impey carb-load
 * sequence. For every day flagged as a competition, the race day and the
 * two preceding days (which may fall in the previous week) are tagged.
 *
 * Returns a NEW array — input weeks/days are not mutated. The day macros
 * from the FFTWR engine are left untouched; the annotation is additive.
 *
 * When two races sit within 48h of each other the later (more acute)
 * stage wins, so the day closest to a race always shows the highest load.
 */
export function applyCompetitionProtocol(
  weeks: WeekPlan[],
  weightKg: number,
): WeekPlan[] {
  // Index every day by date for O(1) lookup across week boundaries.
  const byDate = new Map<
    string,
    { weekIdx: number; dayIdx: number }
  >();
  weeks.forEach((week, weekIdx) => {
    week.days.forEach((day, dayIdx) => {
      byDate.set(day.date, { weekIdx, dayIdx });
    });
  });

  // Collect annotations keyed by date. Higher gPerKg wins on collision.
  const annotations = new Map<string, CarbLoadAnnotation>();

  for (const week of weeks) {
    for (const day of week.days) {
      if (!day.session?.isCompetition) continue;
      const raceDate = day.date;
      for (const stage of IMPEY_CARB_LOAD_SEQUENCE) {
        const targetDate = shiftISO(raceDate, stage.offset);
        if (!byDate.has(targetDate)) continue; // outside the generated range
        const annotation = buildAnnotation(stage, weightKg, raceDate);
        const existing = annotations.get(targetDate);
        if (!existing || annotation.gPerKg > existing.gPerKg) {
          annotations.set(targetDate, annotation);
        }
      }
    }
  }

  if (annotations.size === 0) return weeks;

  // Rebuild only the weeks/days that changed.
  return weeks.map((week) => {
    const touched = week.days.some((d) => annotations.has(d.date));
    if (!touched) return week;
    return {
      ...week,
      days: week.days.map((day) => {
        const annotation = annotations.get(day.date);
        return annotation ? { ...day, carbLoad: annotation } : day;
      }),
    };
  });
}
