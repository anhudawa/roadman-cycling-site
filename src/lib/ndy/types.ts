// ---------------------------------------------------------------------------
// Question option types
// ---------------------------------------------------------------------------

export type TrainingGoal =
  | 'race_with_date'
  | 'specific_watts_target'
  | 'group_ride_fitness'
  | 'general_fitness'
  | 'other';

export type HoursPerWeek =
  | 'under_4'
  | '4_to_6'
  | '6_to_9'
  | '9_to_12'
  | '12_plus';

export type FtpRange =
  | 'under_200'
  | '200_to_280'
  | '280_to_350'
  | '350_plus'
  | 'not_sure';

export type PlateauDuration =
  | 'not_stuck'
  | 'few_months'
  | '6_to_12_months'
  | 'over_a_year'
  | 'no_idea';

export type Frustration =
  | 'plateaued_at_number'
  | 'no_structure'
  | 'lost_motivation'
  | 'recurring_injury'
  | 'other';

export type CoachingHistory =
  | 'never'
  | 'self_coached'
  | 'had_coach_before'
  | 'currently_have_one';

// ---------------------------------------------------------------------------
// Prospect answers (input to routing)
// ---------------------------------------------------------------------------

export interface ProspectAnswers {
  q1TrainingFor: TrainingGoal;
  q2HoursPerWeek: HoursPerWeek;
  q3FtpRange: FtpRange;
  q4PlateauDuration: PlateauDuration;
  q5Frustration: Frustration;
  q6WeightKg: number | null;
  q7CoachingHistory: CoachingHistory;
  q8Freetext: string | null;
}

// ---------------------------------------------------------------------------
// Routing output
// ---------------------------------------------------------------------------

export type RoutingDecision =
  | 'standard'
  | 'premium'
  | 'inner_circle'
  | 'not_a_fit';

export interface RoutingResult {
  decision: RoutingDecision;
  budgetFlag: boolean;
  injuryFlag: boolean;
  computedWpkg: number | null;
}

// ---------------------------------------------------------------------------
// Airtable record shape (what we write)
// ---------------------------------------------------------------------------

export interface NdyProspectRecord {
  timestamp: string;
  q1TrainingFor: TrainingGoal;
  q2HoursPerWeek: HoursPerWeek;
  q3FtpRange: FtpRange;
  q4PlateauDuration: PlateauDuration;
  q5Frustration: Frustration;
  q6WeightKg: number | null;
  q7CoachingHistory: CoachingHistory;
  q8Freetext: string | null;
  computedWpkg: number | null;
  routingDecision: RoutingDecision;
  budgetFlag: boolean;
  injuryFlag: boolean;
  responseShown: string;
  email: string | null;
  buttonClicked: string | null;
  outcome: string | null;
  notes: string | null;
}
