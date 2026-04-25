import { describe, it, expect } from 'vitest';
import { routeProspect } from './routing';
import type { ProspectAnswers, RoutingDecision } from './types';

function prospect(overrides: Partial<ProspectAnswers>): ProspectAnswers {
  return {
    q1TrainingFor: 'general_fitness',
    q2HoursPerWeek: '4_to_6',
    q3FtpRange: 'not_sure',
    q4PlateauDuration: 'no_idea',
    q5Frustration: 'no_structure',
    q6WeightKg: null,
    q7CoachingHistory: 'never',
    q8Freetext: null,
    ...overrides,
  };
}

interface TestCase {
  name: string;
  answers: ProspectAnswers;
  expected: RoutingDecision;
}

const testCases: TestCase[] = [
  // --- Inner Circle (profiles 1-3) ---
  {
    name: '#1: IC $€” 9-12hrs, race, 280-350W, plateau, self-coached, 72kg',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#2: IC $€” 12+hrs, race, 350+W, plateau, had coach, 68kg',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '12_plus',
      q3FtpRange: '350_plus',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 68,
      q7CoachingHistory: 'had_coach_before',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#3: IC via w/kg $€” 200-280W range but 65kg (3.69 w/kg >= 3.5)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 65,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'inner_circle',
  },
  // --- Premium (profiles 4-7) ---
  {
    name: '#4: Premium $€” 200-280W but 80kg (3.0 w/kg, below IC threshold)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 80,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  {
    name: '#5: Premium $€” specific watts target, 6-9hrs, self-coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'plateaued_at_number',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  {
    name: '#6: Premium $€” group ride, 6-9hrs, no structure, had coach',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'had_coach_before',
    }),
    expected: 'premium',
  },
  {
    name: '#7: Premium $€” race, 6-9hrs, 280-350W, no structure, self-coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'no_structure',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  // --- Premium (profiles 8-12, now default for non-IC, non-disqualified) ---
  {
    name: '#8: Premium $€” strong profile, never coached (no longer blocks Premium)',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '350_plus',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 70,
      q7CoachingHistory: 'never',
    }),
    expected: 'premium',
  },
  {
    name: '#9: Premium $€” race goal, 4-6hrs, never coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'never',
    }),
    expected: 'premium',
  },
  {
    name: '#10: Premium $€” general fitness, 4-6hrs, lost motivation, never coached',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
    expected: 'premium',
  },
  {
    name: '#11: Premium $€” group ride, 4-6hrs, lost motivation, self-coached',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  {
    name: '#12: Premium $€” other goal, 6-9hrs, not sure FTP, never coached',
    answers: prospect({
      q1TrainingFor: 'other',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'other',
      q7CoachingHistory: 'never',
    }),
    expected: 'premium',
  },
  // --- Standard (only via budget override) ---
  {
    name: '#13: Standard (budget override) $€” IC profile but mentions cost',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '350_plus',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 69,
      q7CoachingHistory: 'self_coached',
      q8Freetext: 'is this expensive',
    }),
    expected: 'standard',
  },
  {
    name: '#14: Standard (budget override) $€” IC profile, "can\'t afford much"',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '12_plus',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'had_coach_before',
      q8Freetext: "can't afford much right now",
    }),
    expected: 'standard',
  },
  // --- Not a fit (profiles 15-18) ---
  {
    name: '#15: Not a fit $€” under 4hrs, general fitness, recurring injury',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#16: Not a fit $€” under 4hrs, recurring injury + injury in freetext',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
      q8Freetext: 'bad knee from physio',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#17: Not a fit $€” under 4hrs, general fitness (no specific goal)',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#18: Not a fit $€” recurring injury in Q5 + injury confirmed in freetext',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'recurring_injury',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
      q8Freetext: 'recurring back injury from doctor',
    }),
    expected: 'not_a_fit',
  },
  // --- Edge cases (profiles 19-20) ---
  {
    name: '#19: IC $€” currently has a coach, meets all other IC criteria',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'other',
      q6WeightKg: 74,
      q7CoachingHistory: 'currently_have_one',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#20: Premium $€” specific watts, 6-9hrs, other frustration, self-coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'other',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
];

describe('routeProspect', () => {
  for (const tc of testCases) {
    it(tc.name, () => {
      const result = routeProspect(tc.answers);
      expect(result.decision).toBe(tc.expected);
    });
  }
});

describe('routeProspect flags', () => {
  it('sets budgetFlag when freetext contains budget keyword', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'is this expensive' }),
    );
    expect(result.budgetFlag).toBe(true);
  });

  it('does not set budgetFlag on unrelated freetext', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'looking forward to racing' }),
    );
    expect(result.budgetFlag).toBe(false);
  });

  it('sets injuryFlag when freetext contains injury keyword', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'seeing a physio for my knee' }),
    );
    expect(result.injuryFlag).toBe(true);
  });

  it('does not set injuryFlag on unrelated freetext', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'just want to get faster' }),
    );
    expect(result.injuryFlag).toBe(false);
  });

  it('computes w/kg when FTP and weight are provided', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: '280_to_350', q6WeightKg: 70 }),
    );
    expect(result.computedWpkg).toBe(4.5);
  });

  it('returns null w/kg when weight is null', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: '280_to_350', q6WeightKg: null }),
    );
    expect(result.computedWpkg).toBeNull();
  });

  it('returns null w/kg when FTP is not_sure', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: 'not_sure', q6WeightKg: 70 }),
    );
    expect(result.computedWpkg).toBeNull();
  });
});
