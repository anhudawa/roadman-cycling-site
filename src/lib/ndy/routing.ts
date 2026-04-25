import type {
  ProspectAnswers,
  RoutingResult,
  FtpRange,
} from './types';

// ---------------------------------------------------------------------------
// FTP midpoints for w/kg calculation
// ---------------------------------------------------------------------------

const FTP_MIDPOINTS: Record<FtpRange, number> = {
  under_200: 175,
  '200_to_280': 240,
  '280_to_350': 315,
  '350_plus': 375,
  not_sure: 0,
};

// ---------------------------------------------------------------------------
// Keyword scanning
// ---------------------------------------------------------------------------

const BUDGET_KEYWORDS = [
  'cost',
  'budget',
  'afford',
  'expensive',
  'price',
  'cheap',
  'money',
  'too much',
];

const INJURY_KEYWORDS = [
  'injury',
  'injured',
  'physio',
  'doctor',
  'surgery',
  'pain',
  'knee',
  'back',
  'hip',
];

function scanKeywords(text: string | null, keywords: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some((kw) => {
    const pattern = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return pattern.test(lower);
  });
}

// ---------------------------------------------------------------------------
// W/kg computation
// ---------------------------------------------------------------------------

function computeWpkg(ftpRange: FtpRange, weightKg: number | null): number | null {
  if (weightKg === null || weightKg <= 0) return null;
  const midpoint = FTP_MIDPOINTS[ftpRange];
  if (midpoint === 0) return null;
  return Math.round((midpoint / weightKg) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Routing function
// ---------------------------------------------------------------------------

export function routeProspect(answers: ProspectAnswers): RoutingResult {
  const budgetFlag = scanKeywords(answers.q8Freetext, BUDGET_KEYWORDS);
  const injuryFlag = scanKeywords(answers.q8Freetext, INJURY_KEYWORDS);
  const wpkg = computeWpkg(answers.q3FtpRange, answers.q6WeightKg);

  // Rule 1: Not a fit
  if (
    (answers.q5Frustration === 'recurring_injury' && injuryFlag) ||
    (answers.q2HoursPerWeek === 'under_4' && answers.q5Frustration === 'recurring_injury') ||
    (answers.q2HoursPerWeek === 'under_4' && answers.q1TrainingFor === 'general_fitness')
  ) {
    return { decision: 'not_a_fit', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 2: Budget override → Standard
  if (budgetFlag) {
    return { decision: 'standard', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 3: Inner Circle
  const highHours = answers.q2HoursPerWeek === '9_to_12' || answers.q2HoursPerWeek === '12_plus';
  const raceGoal = answers.q1TrainingFor === 'race_with_date';
  const strongFtp =
    answers.q3FtpRange === '280_to_350' ||
    answers.q3FtpRange === '350_plus' ||
    (wpkg !== null && wpkg >= 3.5);
  const icFrustration =
    answers.q5Frustration === 'plateaued_at_number' ||
    answers.q5Frustration === 'other';
  const hasCoachingAwareness =
    answers.q7CoachingHistory === 'self_coached' ||
    answers.q7CoachingHistory === 'had_coach_before' ||
    answers.q7CoachingHistory === 'currently_have_one';

  if (highHours && raceGoal && strongFtp && icFrustration && hasCoachingAwareness) {
    return { decision: 'inner_circle', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 4: Premium (default for almost everyone)
  // Standard is now a basic community tier ($75/yr) without coaching or 5 pillars.
  // Anyone who isn't disqualified, budget-flagged, or Inner Circle should land here.
  return { decision: 'premium', budgetFlag, injuryFlag, computedWpkg: wpkg };
}
