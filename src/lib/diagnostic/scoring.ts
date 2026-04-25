import { QUESTIONS, type Question } from "./questions";
import {
  type Answers,
  type Profile,
  type ProfileScores,
  type ScoringResult,
  TIE_BREAK_ORDER,
} from "./types";

/**
 * Pure scoring for the Masters Plateau Diagnostic. Consumes the raw
 * 0$€“3 answers for Q1$€“Q12, sums each profile's dedicated questions,
 * applies the cross-score bumps declared on specific options, and
 * returns the primary profile plus (optionally) a secondary
 * "contributing factor" when the runner-up sits within 1 point.
 *
 * Spec $§8 $€” tie-breaking, multi-profile output, and edge cases live
 * entirely in this module so the rest of the app can treat the result
 * as opaque.
 */

function findOption(q: Question, value: number) {
  // Answers come in as the option's `value` (0$€“3). A single question
  // may have the same value on multiple options $€” Q5 has two `2`s etc.
  // We take the FIRST match, which matches the spec's one-question-per-
  // screen UI (the user clicks an option, we persist its value, and
  // we'll match it back the same way on score).
  return q.options.find((o) => o.value === value) ?? null;
}

export function computeScores(answers: Answers): ProfileScores {
  const scores: ProfileScores = {
    underRecovered: 0,
    polarisation: 0,
    strengthGap: 0,
    fuelingDeficit: 0,
  };

  for (const q of QUESTIONS) {
    const value = answers[q.key];
    if (typeof value !== "number") continue;
    scores[q.primary] += value;

    const option = findOption(q, value);
    if (!option?.crossScores) continue;
    for (const [profile, bump] of Object.entries(option.crossScores)) {
      if (!bump) continue;
      scores[profile as Profile] += bump;
    }
  }

  return scores;
}

/**
 * Pick the primary profile, using the highest total and breaking ties
 * by `TIE_BREAK_ORDER`. Returns both the primary and $€” when the
 * second place is within 1 point $€” the secondary for a contributing-
 * factor note.
 */
export function assignProfile(scores: ProfileScores): {
  primary: Profile;
  secondary: Profile | null;
} {
  const entries = (Object.entries(scores) as Array<[Profile, number]>).sort(
    ([aK, aV], [bK, bV]) => {
      if (bV !== aV) return bV - aV;
      return TIE_BREAK_ORDER.indexOf(aK) - TIE_BREAK_ORDER.indexOf(bK);
    }
  );

  const [primaryKey, primaryScore] = entries[0];
  const [secondaryKey, secondaryScore] = entries[1];

  return {
    primary: primaryKey,
    secondary: primaryScore - secondaryScore <= 1 ? secondaryKey : null,
  };
}

/**
 * Full scoring pipeline. Applies the two edge cases from $§8:
 *
 * - `closeToBreakthrough`: every profile under 3 points. These folks
 *   probably aren't plateaued the way we measure $€” we still return a
 *   primary via tie-break so downstream rendering has something, but
 *   the caller should swap in the "closer to breakthrough than you
 *   think" template instead of the normal profile breakdown.
 *
 * - `severeMultiSystem`: every profile at 6+. The primary stays as
 *   whatever the tie-break chooses (typically Under-recovered), but
 *   CTA routing should force a direct call booking.
 */
export function scoreDiagnostic(answers: Answers): ScoringResult {
  const scores = computeScores(answers);
  const { primary, secondary } = assignProfile(scores);

  const profileScores = Object.values(scores);
  const closeToBreakthrough = profileScores.every((s) => s < 3);
  const severeMultiSystem = profileScores.every((s) => s >= 6);

  return {
    primary,
    secondary,
    scores,
    closeToBreakthrough,
    severeMultiSystem,
  };
}
