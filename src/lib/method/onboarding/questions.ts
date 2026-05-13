/**
 * Onboarding quiz question definitions.
 *
 * Five steps, last two optional. The flow is deliberately short — every
 * extra question is friction, and only the first three actually change
 * the plan recommendation.
 *
 *   1. Goal              (required — determines plan family)
 *   2. Weekly hours      (required — determines volume tier)
 *   3. Experience level  (required — determines intensity sophistication)
 *   4. FTP               (optional — calibrates zones)
 *   5. Target event      (optional — calibrates periodisation timing)
 */

import {
  GOAL_BLURB,
  GOAL_LABEL,
  LEVEL_BLURB,
  LEVEL_LABEL,
} from "./plan-matrix";
import {
  GOALS,
  LEVELS,
  WEEKLY_HOURS,
  type Goal,
  type Level,
  type WeeklyHours,
} from "./types";

export type StepKey = "goal" | "hours" | "level" | "ftp" | "event";

export const STEP_ORDER: StepKey[] = ["goal", "hours", "level", "ftp", "event"];

export interface OptionDef<T> {
  value: T;
  label: string;
  blurb?: string;
}

export const GOAL_OPTIONS: OptionDef<Goal>[] = GOALS.map((g) => ({
  value: g,
  label: GOAL_LABEL[g],
  blurb: GOAL_BLURB[g],
}));

export const HOURS_OPTIONS: OptionDef<WeeklyHours>[] = WEEKLY_HOURS.map((h) => ({
  value: h,
  label: `${h} hours / week`,
  blurb: hoursBlurb(h),
}));

export const LEVEL_OPTIONS: OptionDef<Level>[] = LEVELS.map((l) => ({
  value: l,
  label: LEVEL_LABEL[l],
  blurb: LEVEL_BLURB[l],
}));

function hoursBlurb(h: WeeklyHours): string {
  switch (h) {
    case 6:
      return "Tight schedule. Three to four rides a week, most under 90 minutes, with a weekend long ride.";
    case 8:
      return "The sweet spot for most working adults. Four rides a week, weekend long ride, one or two quality sessions.";
    case 10:
      return "You can ride five days a week. Long ride climbs into the 3-hour zone. Some midweek intensity.";
    case 12:
      return "Five to six days. Longer rides, more recovery management, more headroom for race-specific work.";
  }
}

export interface StepCopy {
  /** Section eyebrow above the question. */
  eyebrow: string;
  /** Big question, in Bebas Neue. */
  title: string;
  /** Supporting copy under the question. */
  helper: string;
  /** Whether the rider can skip this step. */
  optional: boolean;
}

export const STEP_COPY: Record<StepKey, StepCopy> = {
  goal: {
    eyebrow: "Question 01 of 05",
    title: "What are you training for?",
    helper:
      "Pick the closest match. The plan family is built around this — everything else tunes the dose.",
    optional: false,
  },
  hours: {
    eyebrow: "Question 02 of 05",
    title: "How many hours can you ride in a normal week?",
    helper:
      "Be honest, not aspirational. Plans built around the hours you actually have beat plans built around the hours you wish you had.",
    optional: false,
  },
  level: {
    eyebrow: "Question 03 of 05",
    title: "How much structured training have you done?",
    helper:
      "Not how strong you are — how familiar you are with planned, intentional training.",
    optional: false,
  },
  ftp: {
    eyebrow: "Question 04 of 05 · Optional",
    title: "Do you know your current FTP?",
    helper:
      "If you've done a recent test, drop it in — we'll seed your TrainingPeaks zones from this number. No FTP? Skip it. Module 01 teaches you how to set one honestly.",
    optional: true,
  },
  event: {
    eyebrow: "Question 05 of 05 · Optional",
    title: "Do you have a target event?",
    helper:
      "A specific date lets us anchor the periodisation — base, build and peak land where they need to. No event? Skip.",
    optional: true,
  },
};
