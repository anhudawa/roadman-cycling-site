import { NextResponse } from 'next/server';
import { routeProspect } from '@/lib/ndy/routing';
import { renderResponse } from '@/lib/ndy/templates';
import { createProspect } from '@/lib/ndy/airtable';
import type {
  TrainingGoal,
  HoursPerWeek,
  FtpRange,
  PlateauDuration,
  Frustration,
  CoachingHistory,
  ProspectAnswers,
} from '@/lib/ndy/types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_TRAINING_GOALS: TrainingGoal[] = [
  'race_with_date', 'specific_watts_target', 'group_ride_fitness', 'general_fitness', 'other',
];
const VALID_HOURS: HoursPerWeek[] = [
  'under_4', '4_to_6', '6_to_9', '9_to_12', '12_plus',
];
const VALID_FTP: FtpRange[] = [
  'under_200', '200_to_280', '280_to_350', '350_plus', 'not_sure',
];
const VALID_PLATEAU: PlateauDuration[] = [
  'not_stuck', 'few_months', '6_to_12_months', 'over_a_year', 'no_idea',
];
const VALID_FRUSTRATION: Frustration[] = [
  'plateaued_at_number', 'no_structure', 'lost_motivation', 'recurring_injury', 'other',
];
const VALID_COACHING: CoachingHistory[] = [
  'never', 'self_coached', 'had_coach_before', 'currently_have_one',
];

function validateAnswers(body: unknown): { answers: ProspectAnswers } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (!VALID_TRAINING_GOALS.includes(b.q1TrainingFor as TrainingGoal)) {
    return { error: `Invalid q1TrainingFor: ${b.q1TrainingFor}` };
  }
  if (!VALID_HOURS.includes(b.q2HoursPerWeek as HoursPerWeek)) {
    return { error: `Invalid q2HoursPerWeek: ${b.q2HoursPerWeek}` };
  }
  if (!VALID_FTP.includes(b.q3FtpRange as FtpRange)) {
    return { error: `Invalid q3FtpRange: ${b.q3FtpRange}` };
  }
  if (!VALID_PLATEAU.includes(b.q4PlateauDuration as PlateauDuration)) {
    return { error: `Invalid q4PlateauDuration: ${b.q4PlateauDuration}` };
  }
  if (!VALID_FRUSTRATION.includes(b.q5Frustration as Frustration)) {
    return { error: `Invalid q5Frustration: ${b.q5Frustration}` };
  }
  if (!VALID_COACHING.includes(b.q7CoachingHistory as CoachingHistory)) {
    return { error: `Invalid q7CoachingHistory: ${b.q7CoachingHistory}` };
  }

  const weightKg = b.q6WeightKg;
  if (weightKg !== null && weightKg !== undefined) {
    if (typeof weightKg !== 'number' || weightKg < 40 || weightKg > 160) {
      return { error: 'q6WeightKg must be a number between 40 and 160, or null' };
    }
  }

  const freetext = b.q8Freetext;
  if (freetext !== null && freetext !== undefined) {
    if (typeof freetext !== 'string' || freetext.length > 500) {
      return { error: 'q8Freetext must be a string of 500 characters or fewer, or null' };
    }
  }

  return {
    answers: {
      q1TrainingFor: b.q1TrainingFor as TrainingGoal,
      q2HoursPerWeek: b.q2HoursPerWeek as HoursPerWeek,
      q3FtpRange: b.q3FtpRange as FtpRange,
      q4PlateauDuration: b.q4PlateauDuration as PlateauDuration,
      q5Frustration: b.q5Frustration as Frustration,
      q6WeightKg: (weightKg as number) ?? null,
      q7CoachingHistory: b.q7CoachingHistory as CoachingHistory,
      q8Freetext: (freetext as string) ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateAnswers(body);

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { answers } = validation;
    const routing = routeProspect(answers);
    const response = renderResponse(answers, routing);

    // Write to Airtable (non-blocking $— don't fail the response if Airtable is down)
    const airtablePromise = createProspect({
      timestamp: new Date().toISOString(),
      ...answers,
      computedWpkg: routing.computedWpkg,
      routingDecision: routing.decision,
      budgetFlag: routing.budgetFlag,
      injuryFlag: routing.injuryFlag,
      responseShown: routing.decision,
      email: null,
      buttonClicked: null,
      outcome: null,
      notes: null,
    }).catch((err) => {
      console.error('Airtable write failed:', err);
    });

    // Don't await Airtable $— return the routing decision immediately
    void airtablePromise;

    return NextResponse.json({
      decision: routing.decision,
      computedWpkg: routing.computedWpkg,
      budgetFlag: routing.budgetFlag,
      injuryFlag: routing.injuryFlag,
      response,
    });
  } catch (error) {
    console.error('NDY recommend error:', error);
    const message = error instanceof Error ? error.message : 'Recommendation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
