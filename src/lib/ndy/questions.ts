import type {
  TrainingGoal,
  HoursPerWeek,
  FtpRange,
  PlateauDuration,
  Frustration,
  CoachingHistory,
} from './types';

// ---------------------------------------------------------------------------
// Question option type
// ---------------------------------------------------------------------------

export interface QuestionOption<T extends string = string> {
  value: T;
  label: string;
}

// ---------------------------------------------------------------------------
// Question definitions
// ---------------------------------------------------------------------------

export const Q1_OPTIONS: QuestionOption<TrainingGoal>[] = [
  { value: 'race_with_date', label: 'A race or event with a specific date' },
  { value: 'specific_watts_target', label: 'A specific watts or power number' },
  { value: 'group_ride_fitness', label: 'Sick of getting shelled on the group ride' },
  { value: 'general_fitness', label: 'General fitness, no specific target' },
  { value: 'other', label: 'Something else' },
];

export const Q2_OPTIONS: QuestionOption<HoursPerWeek>[] = [
  { value: 'under_4', label: 'Less than 4 hours' },
  { value: '4_to_6', label: '4\u20136 hours' },
  { value: '6_to_9', label: '6\u20139 hours' },
  { value: '9_to_12', label: '9\u201312 hours' },
  { value: '12_plus', label: '12+ hours' },
];

export const Q3_OPTIONS: QuestionOption<FtpRange>[] = [
  { value: 'under_200', label: 'Under 200W' },
  { value: '200_to_280', label: '200\u2013280W' },
  { value: '280_to_350', label: '280\u2013350W' },
  { value: '350_plus', label: '350W+' },
  { value: 'not_sure', label: 'Not sure / never tested' },
];

export const Q4_OPTIONS: QuestionOption<PlateauDuration>[] = [
  { value: 'not_stuck', label: "I'm not stuck, just getting started" },
  { value: 'few_months', label: 'A few months' },
  { value: '6_to_12_months', label: '6\u201312 months' },
  { value: 'over_a_year', label: 'Over a year' },
  { value: 'no_idea', label: "No idea, I don't test regularly" },
];

export const Q5_OPTIONS: QuestionOption<Frustration>[] = [
  { value: 'plateaued_at_number', label: "Plateaued at a number I can't shift" },
  { value: 'no_structure', label: 'No structure, making it up as I go' },
  { value: 'lost_motivation', label: "Lost motivation, can't stay consistent" },
  { value: 'recurring_injury', label: 'Recurring injury holding me back' },
  { value: 'other', label: 'Something else' },
];

export const Q7_OPTIONS: QuestionOption<CoachingHistory>[] = [
  { value: 'never', label: 'Never had any coaching' },
  { value: 'self_coached', label: 'Self-coached from podcasts, forums, YouTube' },
  { value: 'had_coach_before', label: 'Had a coach before' },
  { value: 'currently_have_one', label: 'Currently have a coach' },
];

// ---------------------------------------------------------------------------
// Question headings (in Anthony's voice)
// ---------------------------------------------------------------------------

export const QUESTION_HEADINGS = {
  q1: 'What are you actually training for?',
  q2: "How many hours a week can you realistically train \u2014 not your fantasy number, your actual number?",
  q3: "What's your current FTP?",
  q4: 'How long have you been stuck at that number?',
  q5: "What's the thing actually doing your head in?",
  q6: "What's your weight?",
  q7: 'Worked with a coach before, or coaching yourself off podcasts and forums?',
  q8: 'Anything else we should know?',
} as const;

// ---------------------------------------------------------------------------
// Step order
// ---------------------------------------------------------------------------

export type StepId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'loading' | 'result';

export const STEP_ORDER: StepId[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'loading', 'result'];

export const TOTAL_QUESTIONS = 8;
