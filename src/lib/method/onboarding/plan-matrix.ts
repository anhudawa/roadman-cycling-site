/**
 * The Method onboarding plan matrix — single source of truth.
 *
 * Every plan that needs to exist in TrainingPeaks is generated here.
 * 4 goals × 4 hour-tiers × 3 levels = 48 plans.
 *
 * Naming convention (must match TrainingPeaks library exactly):
 *   "Method: {Goal} — {Level} — {hours}h/wk"
 *
 * Code convention (used internally and on results URLs):
 *   `{goal}--{level}--{hours}h`
 */

import {
  GOALS,
  LEVELS,
  WEEKLY_HOURS,
  type Goal,
  type Level,
  type PlanEntry,
  type WeeklyHours,
} from "./types";

/* ─── Display data ─────────────────────────────────────────── */

interface GoalDef {
  label: string;
  /** Polarised vs pyramidal default for the goal. */
  intensity: string;
  /** Headline phase breakdown for a 12-week block. */
  structure: string;
  /** One-line summary for the plan card. */
  summaryFor: (level: Level, hours: WeeklyHours) => string;
}

const GOAL_DEFS: Record<Goal, GoalDef> = {
  "gran-fondo": {
    label: "Gran Fondo",
    intensity: "Polarised 80/20",
    structure: "Base 4 / Build 5 / Peak 3",
    summaryFor: (level, hours) =>
      `${hours}-hour ${labelForLevel(level)} block built to peak you for a long-day sportive — sustained endurance, sweet-spot strength and a final-fortnight taper.`,
  },
  racing: {
    label: "Racing",
    intensity: "Pyramidal with race-pace work",
    structure: "Base 3 / Build 5 / Race 4 (with recovery weeks)",
    summaryFor: (level, hours) =>
      `${hours}-hour ${labelForLevel(level)} race block — VO2 and threshold the headline sessions, race-pace efforts inside Build, openers built into Race weeks.`,
  },
  "general-fitness": {
    label: "General Fitness",
    intensity: "Pyramidal, no peak",
    structure: "12 progressive weeks, recovery every 4th",
    summaryFor: (level, hours) =>
      `${hours}-hour ${labelForLevel(level)} health-and-performance block — endurance, tempo and sweet-spot in a sustainable rhythm. No event to peak for, no overreach.`,
  },
  comeback: {
    label: "Comeback",
    intensity: "Endurance-heavy with light tempo",
    structure: "Re-base 6 / Build 4 / Consolidate 2",
    summaryFor: (level, hours) =>
      `${hours}-hour comeback block — most of the work is aerobic, intensity reintroduced slowly, deliberate fatigue-management for riders who've been off the bike.`,
  },
};

function labelForLevel(level: Level): string {
  switch (level) {
    case "beginner":
      return "beginner";
    case "intermediate":
      return "intermediate";
    case "advanced":
      return "advanced";
  }
}

function labelForLevelTitle(level: Level): string {
  return labelForLevel(level).charAt(0).toUpperCase() + labelForLevel(level).slice(1);
}

/* ─── Highlights per cell ──────────────────────────────────── */

function highlightsFor(
  goal: Goal,
  hours: WeeklyHours,
  level: Level,
): [string, string, string] {
  const longestRide = hours <= 6 ? "2 h" : hours <= 8 ? "2.5–3 h" : hours <= 10 ? "3–4 h" : "4–5 h";
  const keySession =
    goal === "gran-fondo"
      ? "1 sweet-spot session"
      : goal === "racing"
        ? "1 VO2 + 1 threshold session"
        : goal === "general-fitness"
          ? "1 tempo session"
          : "1 aerobic-endurance session";

  // Level-led detail.
  const structureNote =
    level === "beginner"
      ? "Built around RPE first, power second — get the habit right before chasing numbers."
      : level === "intermediate"
        ? "Power-targeted intervals with RPE backstops. Recovery weeks every fourth week."
        : "Power and HRV-aware loading. Higher density of quality work, more autonomy on warm-ups.";

  const recoveryNote =
    goal === "comeback"
      ? "Deliberate easy days — comeback work breaks down if you train through fatigue."
      : level === "advanced"
        ? "Recovery is part of the plan, not a sign of weakness."
        : "Two genuine rest days a week — non-negotiable.";

  return [
    `Longest ride: ${longestRide}. ${keySession} per week.`,
    structureNote,
    recoveryNote,
  ];
}

/* ─── Matrix generation ────────────────────────────────────── */

function buildPlan(goal: Goal, hours: WeeklyHours, level: Level): PlanEntry {
  const goalDef = GOAL_DEFS[goal];
  return {
    code: `${goal}--${level}--${hours}h`,
    name: `Method: ${goalDef.label} — ${labelForLevelTitle(level)} — ${hours}h/wk`,
    goal,
    hours,
    level,
    summary: goalDef.summaryFor(level, hours),
    structure: goalDef.structure,
    intensity: goalDef.intensity,
    highlights: highlightsFor(goal, hours, level),
  };
}

/** All 48 plans, generated once at module load. */
export const PLAN_MATRIX: PlanEntry[] = GOALS.flatMap((goal) =>
  WEEKLY_HOURS.flatMap((hours) =>
    LEVELS.map((level) => buildPlan(goal, hours, level)),
  ),
);

/** Quick lookup by code, for results-page deep-linking. */
export const PLAN_BY_CODE: Map<string, PlanEntry> = new Map(
  PLAN_MATRIX.map((p) => [p.code, p]),
);

/* ─── Display-name lookups for the quiz UI ─────────────────── */

export const GOAL_LABEL: Record<Goal, string> = {
  "gran-fondo": "Gran Fondo / Sportive",
  racing: "Racing (Crit / Road)",
  "general-fitness": "General fitness & health",
  comeback: "Comeback (returning after a break)",
};

export const GOAL_BLURB: Record<Goal, string> = {
  "gran-fondo": "You've got a long day on the calendar — Etape, Marmotte, Mallorca 312, a hilly century. You want to be doing the riding, not surviving it.",
  racing: "Crits, road races, Cat 4–2. You want to be sharp at the pointy end, not just hanging on.",
  "general-fitness": "No event. You want to ride well, feel strong, and stop guessing what to do mid-week. Body composition and health are part of the picture.",
  comeback: "You were fit. Life happened — injury, work, family, kids. You're back on the bike and the version of yourself you remember feels a long way off. It isn't.",
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const LEVEL_BLURB: Record<Level, string> = {
  beginner:
    "New to structured training. You ride, maybe a club run, but you've never followed a written plan. Power numbers feel like a foreign language.",
  intermediate:
    "You've done structured blocks before — maybe TrainerRoad, a coach, or a free plan. You know your FTP and roughly what zone 2 feels like. You want more out of the work.",
  advanced:
    "You've followed plans for years. You know your zones, you ride to power, you understand periodisation. You want the framework, not the basics.",
};
