import type { Profile } from "./types";

/**
 * Single source of truth for the 12 diagnostic questions. Every option
 * declares both its primary profile score (0–3) and any cross-score
 * bumps that a specific answer applies to other profiles.
 *
 * Section numbers reference the spec (§7). Keep the option order — the
 * UI relies on stable indices when persisting to sessionStorage.
 */

export type QuestionPrimary = Profile;

export interface QuestionOption {
  /** Short machine-safe id used in analytics + sessionStorage. */
  id: string;
  /** The copy shown in the UI. */
  label: string;
  /** Score applied to the question's primary profile. */
  value: 0 | 1 | 2 | 3;
  /**
   * Additional bumps applied to other profiles on this specific answer.
   * Kept as a partial map so we can call `Object.entries` cleanly.
   */
  crossScores?: Partial<Record<Profile, number>>;
}

export interface Question {
  /** Q1…Q12 — matches the Answers[key] on scoring inputs. */
  key:
    | "Q1"
    | "Q2"
    | "Q3"
    | "Q4"
    | "Q5"
    | "Q6"
    | "Q7"
    | "Q8"
    | "Q9"
    | "Q10"
    | "Q11"
    | "Q12";
  primary: QuestionPrimary;
  prompt: string;
  options: QuestionOption[];
}

export const QUESTIONS: readonly Question[] = [
  // ── UNDER-RECOVERED ────────────────────────────────────
  {
    key: "Q1",
    primary: "underRecovered",
    prompt: "How many hours of sleep do you actually get on most nights?",
    options: [
      { id: "8plus", label: "8+ hours", value: 0 },
      { id: "7to8", label: "7 to 8 hours", value: 1 },
      { id: "6to7", label: "6 to 7 hours", value: 2 },
      { id: "under6", label: "Less than 6 hours", value: 3 },
    ],
  },
  {
    key: "Q2",
    primary: "underRecovered",
    prompt: "How do you feel when you start most training rides?",
    options: [
      { id: "fresh", label: "Fresh and ready", value: 0 },
      {
        id: "flat",
        label: "OK, maybe a bit flat",
        value: 1,
        crossScores: { fuelingDeficit: 1 },
      },
      {
        id: "push",
        label: "Tired but I push through",
        value: 2,
        crossScores: { fuelingDeficit: 1 },
      },
      {
        id: "always-fatigued",
        label: "Always fatigued, the legs never feel good",
        value: 3,
        crossScores: { fuelingDeficit: 1 },
      },
    ],
  },
  {
    key: "Q3",
    primary: "underRecovered",
    prompt:
      "Outside of cycling — work, family, life — what's your stress load been the last three months?",
    options: [
      { id: "low", label: "Low, things are calm", value: 0 },
      { id: "moderate", label: "Moderate, normal life", value: 1 },
      { id: "high", label: "High, I'm running hot", value: 2 },
      {
        id: "extreme",
        label: "Extreme, I'm barely holding it together",
        value: 3,
      },
    ],
  },

  // ── POLARISATION FAILURE ───────────────────────────────
  {
    key: "Q4",
    primary: "polarisation",
    prompt:
      "What percentage of your weekly riding time is genuinely easy? (Easy meaning you could hold a full conversation, Zone 1–2.)",
    options: [
      { id: "80plus", label: "80% or more", value: 0 },
      { id: "70to80", label: "70 to 80%", value: 1 },
      { id: "50to70", label: "50 to 70%", value: 2 },
      { id: "under50", label: "Less than 50%", value: 3 },
    ],
  },
  {
    key: "Q5",
    primary: "polarisation",
    prompt:
      "What percentage of your weekly time is at or above threshold — genuinely hard, not tempo?",
    options: [
      {
        id: "10to20-recovered",
        label: "10 to 20% with proper recovery",
        value: 0,
      },
      { id: "5to10", label: "5 to 10%", value: 1 },
      {
        id: "under5",
        label: "Less than 5%, I rarely go that deep",
        value: 3,
      },
      { id: "over20", label: "More than 20%", value: 2 },
    ],
  },
  {
    key: "Q6",
    primary: "polarisation",
    prompt:
      'Think about your "middle" efforts — tempo, sweet spot, sub-threshold. How much of your weekly training time lives there?',
    options: [
      { id: "under10", label: "Less than 10%", value: 0 },
      { id: "10to20", label: "10 to 20%", value: 1 },
      { id: "20to40", label: "20 to 40%", value: 2 },
      {
        id: "over40",
        label: "More than 40%, honestly most of my riding",
        value: 3,
      },
    ],
  },

  // ── STRENGTH GAP ───────────────────────────────────────
  {
    key: "Q7",
    primary: "strengthGap",
    prompt: "How often do you lift?",
    options: [
      {
        id: "twice",
        label: "Two or more proper sessions a week",
        value: 0,
      },
      { id: "once", label: "One session a week", value: 1 },
      {
        id: "occasional",
        label: "Occasionally, when I remember",
        value: 2,
      },
      { id: "never", label: "Never, or not for years", value: 3 },
    ],
  },
  {
    key: "Q8",
    primary: "strengthGap",
    prompt:
      "Your sprint and one-minute power compared to two or three years ago —",
    options: [
      { id: "better", label: "Better", value: 0 },
      { id: "same", label: "About the same", value: 1 },
      { id: "slight-down", label: "Slightly down", value: 2 },
      {
        id: "significant-down",
        label: "Significantly down",
        value: 3,
        crossScores: { underRecovered: 1 },
      },
    ],
  },
  {
    key: "Q9",
    primary: "strengthGap",
    prompt:
      "When you go deep on a climb or follow an attack, what actually fails first?",
    options: [
      { id: "cardio", label: "Cardio, I'm blown", value: 0 },
      { id: "sustained", label: "Sustained power", value: 1 },
      {
        id: "hollow",
        label: "Legs feel hollow, no top end",
        value: 3,
      },
      {
        id: "general",
        label: "Just general fatigue, everything goes at once",
        value: 2,
      },
    ],
  },

  // ── FUELING DEFICIT ────────────────────────────────────
  {
    key: "Q10",
    primary: "fuelingDeficit",
    prompt:
      "On a ride of two or more hours, how many grams of carbs are you taking in per hour?",
    options: [
      { id: "80plus", label: "80g or more", value: 0 },
      { id: "60to80", label: "60 to 80g", value: 1 },
      { id: "40to60", label: "40 to 60g", value: 2 },
      {
        id: "under40",
        label: "Under 40g, or I often ride fasted",
        value: 3,
      },
    ],
  },
  {
    key: "Q11",
    primary: "fuelingDeficit",
    prompt: "Which describes your relationship with weight right now?",
    options: [
      {
        id: "racing-weight",
        label: "I'm at a good racing weight and eating properly",
        value: 0,
      },
      {
        id: "trying-lose",
        label: "Trying to lose 1–3kg sensibly",
        value: 1,
      },
      {
        id: "chronic",
        label: "Chronically trying to lose weight, restrict often",
        value: 2,
      },
      {
        id: "constant",
        label: "Weight is a constant focus, I under-eat to hit it",
        value: 3,
      },
    ],
  },
  {
    key: "Q12",
    primary: "fuelingDeficit",
    prompt:
      "The day after a hard long ride, how do you typically feel?",
    options: [
      { id: "hungry-strong", label: "Hungry and strong, ready to go", value: 0 },
      { id: "tired-normal", label: "Tired but appetite normal", value: 1 },
      {
        id: "flat-low",
        label: "Flat, low appetite",
        value: 2,
        crossScores: { underRecovered: 1 },
      },
      {
        id: "wrecked",
        label: "Wrecked, can't seem to bounce back",
        value: 3,
        crossScores: { underRecovered: 1 },
      },
    ],
  },
] as const;

export function questionByKey(key: Question["key"]): Question {
  const q = QUESTIONS.find((x) => x.key === key);
  if (!q) throw new Error(`Unknown question key: ${key}`);
  return q;
}
