/**
 * Generates 20 sample NDY prospect responses for Anthony's review.
 * Run: npx tsx scripts/generate-ndy-samples.ts
 * Output: docs/superpowers/ndy-sample-responses.md
 */

import { routeProspect } from '../src/lib/ndy/routing';
import { renderResponse } from '../src/lib/ndy/templates';
import type { ProspectAnswers } from '../src/lib/ndy/types';
import { writeFileSync } from 'fs';
import { join } from 'path';

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

const profiles: { label: string; answers: ProspectAnswers }[] = [
  // Inner Circle (3)
  {
    label: 'Serious racer, 9-12hrs, 280-350W, 72kg, plateaued, self-coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'self_coached',
    }),
  },
  {
    label: 'High-volume racer, 12+hrs, 350W+, 68kg, had coach before',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '12_plus',
      q3FtpRange: '350_plus',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 68,
      q7CoachingHistory: 'had_coach_before',
    }),
  },
  {
    label: 'Lighter rider IC via w/kg, 200-280W, 65kg (3.69 w/kg)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 65,
      q7CoachingHistory: 'self_coached',
    }),
  },
  // Premium (4)
  {
    label: 'Race goal, 9-12hrs, 200-280W, 80kg (3.0 w/kg, below IC)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 80,
      q7CoachingHistory: 'self_coached',
    }),
  },
  {
    label: 'Watts target, 6-9hrs, 200-280W, self-coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'plateaued_at_number',
      q7CoachingHistory: 'self_coached',
    }),
  },
  {
    label: 'Group ride, 6-9hrs, under 200W, no structure, had coach',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'had_coach_before',
    }),
  },
  {
    label: 'Race goal, 6-9hrs, 280-350W, 75kg, no structure, self-coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'no_structure',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
    }),
  },
  // Standard (7)
  {
    label: 'Strong profile but never coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '350_plus',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 70,
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'Race goal, 4-6hrs, never coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'General fitness, 4-6hrs, lost motivation, never coached',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'Group ride, 4-6hrs, lost motivation, self-coached',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'self_coached',
    }),
  },
  {
    label: 'Other goal, 6-9hrs, FTP unknown, never coached',
    answers: prospect({
      q1TrainingFor: 'other',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'other',
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'IC profile but mentions cost (budget override)',
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
  },
  {
    label: 'IC profile, "can\'t afford much" (budget override)',
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
  },
  // Not a fit (4)
  {
    label: 'Under 4hrs, general fitness, recurring injury',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'Under 4hrs, recurring injury + physio in freetext',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
      q8Freetext: 'bad knee from physio',
    }),
  },
  {
    label: 'Under 4hrs, general fitness, lost motivation (no goal)',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
  },
  {
    label: 'Race goal, 4-6hrs, recurring injury confirmed by doctor',
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
  },
  // Edge cases (2)
  {
    label: 'IC with current coach (currently_have_one passes IC)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'other',
      q6WeightKg: 74,
      q7CoachingHistory: 'currently_have_one',
    }),
  },
  {
    label: 'Premium with "other" frustration, specific watts target',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'other',
      q7CoachingHistory: 'self_coached',
    }),
  },
];

// Generate the markdown
const lines: string[] = [
  '# NDY Sales Assistant \u2014 Sample Responses for Anthony\'s Review',
  '',
  `Generated: ${new Date().toISOString().split('T')[0]}`,
  '',
  '20 sample prospect profiles run through the routing logic and response templates.',
  'Each entry shows the prospect profile, routing decision, and the full response they would see.',
  '',
  '**Anthony: review each response for voice accuracy. Flag any that don\'t sound like you.',
  'Mark each as APPROVED or NEEDS EDIT with notes.**',
  '',
  '---',
  '',
];

for (let i = 0; i < profiles.length; i++) {
  const { label, answers } = profiles[i];
  const result = routeProspect(answers);
  const response = renderResponse(answers, result);

  lines.push(`## Profile ${i + 1}: ${label}`);
  lines.push('');
  lines.push(`**Routing:** ${result.decision.toUpperCase().replace('_', ' ')}${result.budgetFlag ? ' (budget override)' : ''}${result.injuryFlag ? ' (injury flagged)' : ''}${result.computedWpkg ? ` | ${result.computedWpkg} w/kg` : ''}`);
  lines.push('');
  lines.push('| Question | Answer |');
  lines.push('|----------|--------|');
  lines.push(`| Training for | ${answers.q1TrainingFor} |`);
  lines.push(`| Hours/week | ${answers.q2HoursPerWeek} |`);
  lines.push(`| FTP range | ${answers.q3FtpRange} |`);
  lines.push(`| Plateau | ${answers.q4PlateauDuration} |`);
  lines.push(`| Frustration | ${answers.q5Frustration} |`);
  lines.push(`| Weight | ${answers.q6WeightKg ?? 'skipped'} |`);
  lines.push(`| Coaching history | ${answers.q7CoachingHistory} |`);
  lines.push(`| Freetext | ${answers.q8Freetext ?? '\u2014'} |`);
  lines.push('');
  lines.push(`### ${response.headline}`);
  lines.push('');
  lines.push(response.body);
  lines.push('');
  lines.push(`**Primary CTA:** ${response.primaryCta.label}`);
  lines.push(`**Secondary CTA:** ${response.secondaryCta.label}`);
  if (response.tertiaryCta) {
    lines.push(`**Tertiary CTA:** ${response.tertiaryCta.label}`);
  }
  lines.push('');
  lines.push('**Anthony\'s verdict:** [ ] APPROVED / [ ] NEEDS EDIT');
  lines.push('**Notes:**');
  lines.push('');
  lines.push('---');
  lines.push('');
}

const output = lines.join('\n');
const outPath = join(__dirname, '..', 'docs', 'superpowers', 'ndy-sample-responses.md');
writeFileSync(outPath, output, 'utf-8');
console.log(`Written ${profiles.length} sample responses to ${outPath}`);
