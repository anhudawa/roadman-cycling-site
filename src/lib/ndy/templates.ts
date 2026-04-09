import type {
  ProspectAnswers,
  RoutingDecision,
  RoutingResult,
  TrainingGoal,
  HoursPerWeek,
  FtpRange,
  Frustration,
  CoachingHistory,
} from './types';
import { NDY_CONFIG } from './config';

// ---------------------------------------------------------------------------
// Human-readable label maps
// ---------------------------------------------------------------------------

const GOAL_LABELS: Record<TrainingGoal, string> = {
  race_with_date: 'a specific race or event',
  specific_watts_target: 'a watts target',
  group_ride_fitness: 'not getting dropped on the group ride',
  general_fitness: 'general fitness',
  other: 'your own goal',
};

const HOURS_LABELS: Record<HoursPerWeek, string> = {
  under_4: 'under 4 hours a week',
  '4_to_6': '4 to 6 hours a week',
  '6_to_9': '6 to 9 hours a week',
  '9_to_12': '9 to 12 hours a week',
  '12_plus': '12+ hours a week',
};

const FTP_LABELS: Record<FtpRange, string> = {
  under_200: 'under 200W',
  '200_to_280': '200 to 280W',
  '280_to_350': '280 to 350W',
  '350_plus': '350W+',
  not_sure: 'not tested yet',
};

const FRUSTRATION_LABELS: Record<Frustration, string> = {
  plateaued_at_number: 'stuck at a number you can\'t shift',
  no_structure: 'no structure in your training',
  lost_motivation: 'struggling with motivation',
  recurring_injury: 'dealing with a recurring injury',
  other: 'something specific holding you back',
};

const COACHING_LABELS: Record<CoachingHistory, string> = {
  never: 'never had coaching',
  self_coached: 'self-coached from podcasts and forums',
  had_coach_before: 'worked with a coach before',
  currently_have_one: 'currently working with a coach',
};

// ---------------------------------------------------------------------------
// Template rendering context
// ---------------------------------------------------------------------------

export interface TemplateContext {
  goal: string;
  hours: string;
  ftp: string;
  frustration: string;
  coaching: string;
  wpkg: string | null;
}

export function buildContext(answers: ProspectAnswers, result: RoutingResult): TemplateContext {
  return {
    goal: GOAL_LABELS[answers.q1TrainingFor],
    hours: HOURS_LABELS[answers.q2HoursPerWeek],
    ftp: FTP_LABELS[answers.q3FtpRange],
    frustration: FRUSTRATION_LABELS[answers.q5Frustration],
    coaching: COACHING_LABELS[answers.q7CoachingHistory],
    wpkg: result.computedWpkg !== null ? `${result.computedWpkg} w/kg` : null,
  };
}

// ---------------------------------------------------------------------------
// Response template type
// ---------------------------------------------------------------------------

export interface TierRecommendation {
  tierName: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
}

export interface RenderedResponse {
  decision: RoutingDecision;
  headline: string;
  body: string;
  recommendation: TierRecommendation | null;
  primaryCta: { label: string; url: string };
  secondaryCta: { label: string; url: string };
  tertiaryCta: { label: string; url: string } | null;
}

// ---------------------------------------------------------------------------
// The four templates
// ---------------------------------------------------------------------------

function renderStandard(ctx: TemplateContext): RenderedResponse {
  return {
    decision: 'standard',
    headline: 'Standard is the right starting point.',
    body: [
      `So you're training ${ctx.hours}, you're ${ctx.frustration}, and you've ${ctx.coaching}. Here's the thing \u2014 that's a fixable situation. Most of the riders in our community started exactly where you are right now.`,
      `What you're missing isn't more hours or more intensity. It's structure. A clear plan that fits the time you actually have, not the time you wish you had. That's what Standard gives you.`,
    ].join('\n\n'),
    recommendation: {
      tierName: 'Standard',
      tagline: 'The 5-pillar coaching system',
      price: '$15',
      period: '/month',
      features: [
        'Weekly structured training plans',
        'Group coaching calls with Anthony',
        'Cycling-specific strength programme',
        'Nutrition guidance',
        'Community of serious cyclists',
      ],
    },
    primaryCta: {
      label: 'Start your 7-day free trial',
      url: NDY_CONFIG.skoolStandard,
    },
    secondaryCta: {
      label: 'Talk to someone first',
      url: NDY_CONFIG.contactPage,
    },
    tertiaryCta: {
      label: 'Not ready yet \u2014 send me the free resources',
      url: NDY_CONFIG.freeResources,
    },
  };
}

function renderPremium(ctx: TemplateContext): RenderedResponse {
  const ftpLine = ctx.wpkg
    ? `You're sitting at ${ctx.ftp} (${ctx.wpkg}), training ${ctx.hours}, and you're ${ctx.frustration}.`
    : `You're at ${ctx.ftp}, training ${ctx.hours}, and you're ${ctx.frustration}.`;

  return {
    decision: 'premium',
    headline: 'Personal coaching is the right fit.',
    body: [
      `${ftpLine} You've been around long enough to know that more volume isn't the answer. The riders who break through plateaus aren't training more \u2014 they're training with precision.`,
      `You're training ${ctx.hours} with ${ctx.goal} in mind. That's enough time to do real work if the structure is right. This is how we make those hours count.`,
    ].join('\n\n'),
    recommendation: {
      tierName: 'Premium',
      tagline: 'Personal coaching using the 5-pillar system',
      price: '$195',
      period: '/month',
      features: [
        'Personalised TrainingPeaks plans built around your life',
        'Priority coaching calls with Anthony',
        'Advanced masterclasses on periodisation and race prep',
        'Regular 1:1 plan reviews',
        'Everything in Standard included',
      ],
    },
    primaryCta: {
      label: 'Start your 7-day free trial',
      url: NDY_CONFIG.skoolPremium,
    },
    secondaryCta: {
      label: 'Book a call first',
      url: NDY_CONFIG.calendlyPremium,
    },
    tertiaryCta: {
      label: 'Not ready yet \u2014 send me the free resources',
      url: NDY_CONFIG.freeResources,
    },
  };
}

function renderInnerCircle(ctx: TemplateContext): RenderedResponse {
  const ftpLine = ctx.wpkg
    ? `${ctx.ftp} at ${ctx.wpkg}`
    : ctx.ftp;

  return {
    decision: 'inner_circle',
    headline: 'We should talk.',
    body: [
      `You're doing ${ctx.hours}, targeting ${ctx.goal}, sitting at ${ftpLine}, and you've ${ctx.coaching}. That's not a beginner profile. That's someone who's done the work and hit a ceiling.`,
      `Inner Circle is something we don't list publicly. It's a small group \u2014 direct access to me, quarterly strategy calls, priority on everything, and a level of personalisation that doesn't scale beyond a handful of riders. The conversation comes first because this only works if it's the right fit on both sides.`,
    ].join('\n\n'),
    recommendation: {
      tierName: 'Inner Circle',
      tagline: 'Direct access to Anthony. By conversation only.',
      price: '$697',
      period: '/month',
      features: [
        'Direct access to Anthony',
        'Quarterly strategy calls',
        'Priority on everything',
        'Full personalisation',
        'Everything in Premium included',
      ],
    },
    primaryCta: {
      label: 'Book a call with Anthony',
      url: NDY_CONFIG.calendlyInnerCircle,
    },
    secondaryCta: {
      label: 'Tell me more first',
      url: NDY_CONFIG.contactPage,
    },
    tertiaryCta: {
      label: 'Not ready yet \u2014 send me the free resources',
      url: NDY_CONFIG.freeResources,
    },
  };
}

function renderNotAFit(ctx: TemplateContext): RenderedResponse {
  const isInjury = ctx.frustration.includes('injury');

  const body = isInjury
    ? [
        `You mentioned a recurring injury, and I want to be straight with you \u2014 coaching isn't the right next step here. What you need first is someone who can look at the injury properly. A good sports physio or your doctor. Trying to train through it with a structured plan is just going to make a fixable problem worse.`,
        `That doesn't mean you're stuck. Get the injury sorted, build back from there, and when you can train with structure again, we'll be here. In the meantime, I've put together some free resources that'll help you think about your training differently once you're back on the bike.`,
      ].join('\n\n')
    : [
        `Here's the honest answer \u2014 paid coaching isn't the right move for you right now. With ${ctx.hours} and ${ctx.goal} on the table, the return on a monthly coaching plan isn't going to be there yet. I'd rather tell you that now than take your money and have you wondering why nothing's changing in three months.`,
        `The good news is there's plenty you can do for free. I've put together resources that cover the fundamentals \u2014 how to structure what time you do have, basic nutrition, and how to build consistency. Start there. When your hours or goals shift, come back and we'll find the right fit.`,
      ].join('\n\n');

  return {
    decision: 'not_a_fit',
    headline: 'Honest answer \u2014 not right now.',
    body,
    recommendation: null,
    primaryCta: {
      label: 'Get the free resources',
      url: '#email-capture',
    },
    secondaryCta: {
      label: 'Talk to someone anyway',
      url: NDY_CONFIG.contactPage,
    },
    tertiaryCta: null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const RENDERERS: Record<RoutingDecision, (ctx: TemplateContext) => RenderedResponse> = {
  standard: renderStandard,
  premium: renderPremium,
  inner_circle: renderInnerCircle,
  not_a_fit: renderNotAFit,
};

export function renderResponse(
  answers: ProspectAnswers,
  result: RoutingResult,
): RenderedResponse {
  const ctx = buildContext(answers, result);
  return RENDERERS[result.decision](ctx);
}
