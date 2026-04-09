import { describe, it, expect } from 'vitest';
import { renderResponse, buildContext } from './templates';
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

describe('buildContext', () => {
  it('maps structured answers to human-readable labels', () => {
    const answers = prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q5Frustration: 'plateaued_at_number',
      q7CoachingHistory: 'self_coached',
    });
    const result = routeProspect(answers);
    const ctx = buildContext(answers, result);

    expect(ctx.goal).toBe('a specific race or event');
    expect(ctx.hours).toBe('9 to 12 hours a week');
    expect(ctx.ftp).toBe('280 to 350W');
    expect(ctx.frustration).toBe("stuck at a number you can't shift");
    expect(ctx.coaching).toBe('self-coached from podcasts and forums');
  });

  it('includes w/kg when weight is provided', () => {
    const answers = prospect({
      q3FtpRange: '280_to_350',
      q6WeightKg: 70,
    });
    const result = routeProspect(answers);
    const ctx = buildContext(answers, result);

    expect(ctx.wpkg).toBe('4.5 w/kg');
  });

  it('returns null w/kg when weight is not provided', () => {
    const answers = prospect({ q3FtpRange: '280_to_350' });
    const result = routeProspect(answers);
    const ctx = buildContext(answers, result);

    expect(ctx.wpkg).toBeNull();
  });
});

describe('renderResponse', () => {
  it('renders Standard template for standard routing', () => {
    const answers = prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: '4_to_6',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('standard');
    expect(response.headline).toContain('Standard');
    expect(response.body).toContain('4 to 6 hours a week');
    expect(response.body).toContain('struggling with motivation');
    expect(response.body).toContain('never had coaching');
    expect(response.primaryCta.label).toContain('free trial');
    expect(response.primaryCta.url).toContain('skool.com');
  });

  it('renders Premium template with w/kg when available', () => {
    const answers = prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '280_to_350',
      q5Frustration: 'no_structure',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('premium');
    expect(response.headline).toContain('coaching');
    expect(response.recommendation?.tierName).toBe('Premium');
    expect(response.recommendation?.price).toBe('$195');
    expect(response.body).toContain('280 to 350W');
    expect(response.body).toContain('4.2 w/kg');
    expect(response.body).toContain('a specific race or event');
  });

  it('renders Premium template without w/kg when weight missing', () => {
    const answers = prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q5Frustration: 'plateaued_at_number',
      q7CoachingHistory: 'self_coached',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('premium');
    expect(response.body).not.toContain('w/kg');
  });

  it('renders Inner Circle template for IC routing', () => {
    const answers = prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'self_coached',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('inner_circle');
    expect(response.headline).toContain('talk');
    expect(response.body).toContain('Inner Circle');
    expect(response.body).toContain('don\'t list publicly');
    expect(response.primaryCta.label).toContain('Anthony');
  });

  it('renders Not A Fit template with injury language for injury cases', () => {
    const answers = prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q5Frustration: 'recurring_injury',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('not_a_fit');
    expect(response.body).toContain('injury');
    expect(response.body).toContain('physio');
    expect(response.primaryCta.label).toContain('free resources');
    expect(response.tertiaryCta).toBeNull();
  });

  it('renders Not A Fit template with hours/goal language for non-injury cases', () => {
    const answers = prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q5Frustration: 'lost_motivation',
    });
    const result = routeProspect(answers);
    const response = renderResponse(answers, result);

    expect(response.decision).toBe('not_a_fit');
    expect(response.body).toContain('under 4 hours a week');
    expect(response.body).not.toContain('physio');
  });

  it('all templates have no exclamation marks', () => {
    const profiles: Partial<ProspectAnswers>[] = [
      { q1TrainingFor: 'general_fitness', q2HoursPerWeek: '4_to_6', q7CoachingHistory: 'never' },
      { q1TrainingFor: 'race_with_date', q2HoursPerWeek: '6_to_9', q5Frustration: 'no_structure', q7CoachingHistory: 'self_coached' },
      { q1TrainingFor: 'race_with_date', q2HoursPerWeek: '9_to_12', q3FtpRange: '280_to_350', q5Frustration: 'plateaued_at_number', q6WeightKg: 72, q7CoachingHistory: 'self_coached' },
      { q1TrainingFor: 'general_fitness', q2HoursPerWeek: 'under_4', q5Frustration: 'recurring_injury' },
    ];

    for (const p of profiles) {
      const answers = prospect(p);
      const result = routeProspect(answers);
      const response = renderResponse(answers, result);
      expect(response.body).not.toContain('!');
      expect(response.headline).not.toContain('!');
    }
  });

  it('no templates contain banned words', () => {
    const banned = ['elevate', 'unlock', 'journey', 'amazing', 'incredible', 'awesome', 'Ready to'];

    const profiles: Partial<ProspectAnswers>[] = [
      {},
      { q1TrainingFor: 'race_with_date', q2HoursPerWeek: '6_to_9', q5Frustration: 'no_structure', q7CoachingHistory: 'self_coached' },
      { q1TrainingFor: 'race_with_date', q2HoursPerWeek: '9_to_12', q3FtpRange: '280_to_350', q5Frustration: 'plateaued_at_number', q6WeightKg: 72, q7CoachingHistory: 'self_coached' },
      { q1TrainingFor: 'general_fitness', q2HoursPerWeek: 'under_4', q5Frustration: 'recurring_injury' },
    ];

    for (const p of profiles) {
      const answers = prospect(p);
      const result = routeProspect(answers);
      const response = renderResponse(answers, result);
      const fullText = `${response.headline} ${response.body}`.toLowerCase();
      for (const word of banned) {
        expect(fullText).not.toContain(word.toLowerCase());
      }
    }
  });
});
