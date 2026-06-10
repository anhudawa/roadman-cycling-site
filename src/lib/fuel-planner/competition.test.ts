/**
 * Competition carb-load protocol — Tests
 *
 * Verifies the Impey 48hr carb-load + taper sequence is layered onto race
 * days without touching the verified FFTWR daily macros.
 */

import { describe, test, expect } from 'vitest';
import {
  IMPEY_CARB_LOAD_SEQUENCE,
  carbLoadTargetG,
  applyCompetitionProtocol,
} from './competition';
import { generateCalendar } from './calendar';
import type { UserProfile, MealConfig } from './types';
import type { WeekPattern } from './calendar';

const PROFILE: UserProfile = {
  sex: 'male',
  age: 42,
  heightCm: 188,
  weightKg: 80,
  bodyCompGoal: 'maintain',
  deficitPct: 15,
  surplusPct: 0,
  ftp: 250,
  activityLevel: 'moderate',
};

const MEALS: MealConfig[] = [
  { slot: 'breakfast', time: '07:30', enabled: true },
  { slot: 'lunch', time: '12:30', enabled: true },
  { slot: 'dinner', time: '19:30', enabled: true },
];

/** A week pattern with a race on Sunday (index 6). */
function patternWithSundayRace(): WeekPattern {
  const rest = { templateId: null };
  return [
    rest,
    { templateId: '4x5_threshold', startTime: '17:30' },
    rest,
    { templateId: '5x2_vo2', startTime: '17:30' },
    rest,
    { templateId: 'z2_endurance_short', startTime: '09:00' },
    {
      templateId: 'race_tuneup',
      startTime: '09:00',
      isCompetition: true,
    },
  ] as unknown as WeekPattern;
}

describe('carbLoadTargetG', () => {
  test('8 g/kg for an 80kg rider = 640g', () => {
    expect(carbLoadTargetG(80, 8)).toBe(640);
  });

  test('rounds to the nearest gram', () => {
    expect(carbLoadTargetG(81.8, 10)).toBe(818);
  });
});

describe('IMPEY_CARB_LOAD_SEQUENCE', () => {
  test('spans the 8–12 g/kg range across three stages', () => {
    const rates = IMPEY_CARB_LOAD_SEQUENCE.map((s) => s.gPerKg);
    expect(Math.min(...rates)).toBe(8);
    expect(Math.max(...rates)).toBe(12);
    expect(IMPEY_CARB_LOAD_SEQUENCE).toHaveLength(3);
  });

  test('escalates toward race day', () => {
    const offsets = IMPEY_CARB_LOAD_SEQUENCE.map((s) => s.offset);
    expect(offsets).toEqual([-2, -1, 0]);
    // g/kg increases as offset approaches 0
    for (let i = 1; i < IMPEY_CARB_LOAD_SEQUENCE.length; i++) {
      expect(IMPEY_CARB_LOAD_SEQUENCE[i]!.gPerKg).toBeGreaterThan(
        IMPEY_CARB_LOAD_SEQUENCE[i - 1]!.gPerKg,
      );
    }
  });
});

describe('applyCompetitionProtocol via generateCalendar', () => {
  const weeks = generateCalendar(PROFILE, patternWithSundayRace(), MEALS, {
    startDate: '2026-06-01', // Monday
    numWeeks: 2,
  });

  test('annotates the race day with the peak race-day load', () => {
    const sunday = weeks[0]!.days[6]!;
    expect(sunday.session?.isCompetition).toBe(true);
    expect(sunday.carbLoad).toBeDefined();
    expect(sunday.carbLoad!.stage).toBe('race');
    expect(sunday.carbLoad!.gPerKg).toBe(12);
    expect(sunday.carbLoad!.targetCarbsG).toBe(carbLoadTargetG(80, 12));
    expect(sunday.carbLoad!.raceDate).toBe(sunday.date);
  });

  test('annotates the two lead-in days with load + peak stages', () => {
    const saturday = weeks[0]!.days[5]!;
    const friday = weeks[0]!.days[4]!;
    expect(saturday.carbLoad!.stage).toBe('peak'); // 24h out
    expect(saturday.carbLoad!.gPerKg).toBe(10);
    expect(friday.carbLoad!.stage).toBe('load'); // 48h out
    expect(friday.carbLoad!.gPerKg).toBe(8);
  });

  test('leaves the verified FFTWR daily macros untouched', () => {
    // Race day still carries the engine's macro totals; the load is additive.
    const sunday = weeks[0]!.days[6]!;
    expect(sunday.totals.calories).toBeGreaterThan(0);
    expect(sunday.totals.carbsG).toBeGreaterThan(0);
    // The carb-load target is the acute pre-race figure, far above the
    // periodised daily carbs — proving it is a separate prescription.
    expect(sunday.carbLoad!.targetCarbsG).toBeGreaterThan(sunday.totals.carbsG);
  });

  test('non-race days outside the 48h window carry no annotation', () => {
    const tuesday = weeks[0]!.days[1]!;
    expect(tuesday.carbLoad).toBeUndefined();
  });
});
