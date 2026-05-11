/**
 * The Roadman Method — emotional arc.
 *
 * The 12-week course is sequenced into four 3-week phases. The phase
 * label is shown on the dashboard and the module page header to
 * reinforce the narrative arc the syllabus is built around:
 *
 *   Weeks 1–3  → Clarity     ("the noise stops")
 *   Weeks 4–6  → Confidence  ("you start trusting the process")
 *   Weeks 7–9  → Momentum    ("the numbers start moving")
 *   Weeks 10–12 → Ownership  ("you've become your own coach")
 *
 * `getPhaseForWeek` is the only API consumers need. It is total — it
 * always returns a phase for any week index 1–12 (and 12+ folds into
 * Ownership for grad-week edge cases).
 */
export type PhaseKey = "clarity" | "confidence" | "momentum" | "ownership";

export interface Phase {
  key: PhaseKey;
  label: string;
  weeksLabel: string;
  /** One-line emotional cue used in the dashboard hero. */
  cue: string;
  /** Numeric range (inclusive). */
  startWeek: number;
  endWeek: number;
}

export const METHOD_PHASES: readonly Phase[] = [
  {
    key: "clarity",
    label: "Clarity",
    weeksLabel: "Weeks 1–3",
    cue: "The noise stops. You stop second-guessing every session.",
    startWeek: 1,
    endWeek: 3,
  },
  {
    key: "confidence",
    label: "Confidence",
    weeksLabel: "Weeks 4–6",
    cue: "You're doing things differently — and feeling it.",
    startWeek: 4,
    endWeek: 6,
  },
  {
    key: "momentum",
    label: "Momentum",
    weeksLabel: "Weeks 7–9",
    cue: "The numbers start moving. Other riders start noticing.",
    startWeek: 7,
    endWeek: 9,
  },
  {
    key: "ownership",
    label: "Ownership",
    weeksLabel: "Weeks 10–12",
    cue: "You're not following a plan anymore. You're running the system.",
    startWeek: 10,
    endWeek: 12,
  },
] as const;

export function getPhaseForWeek(weekIndex: number): Phase {
  for (const phase of METHOD_PHASES) {
    if (weekIndex >= phase.startWeek && weekIndex <= phase.endWeek) return phase;
  }
  // Fold edge cases into Ownership — grad-week, future content.
  return METHOD_PHASES[3];
}
