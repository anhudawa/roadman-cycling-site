/**
 * Post-diagnostic product routing.
 *
 * The Plateau Diagnostic is the universal entry point for every paid
 * product. This module decides which one a given result should funnel
 * toward, and supplies the personalised copy the results page renders.
 *
 * Three destinations:
 *   - method      → The Roadman Method, $297 once. A 12-week self-serve
 *                   system for a single, clear structural gap.
 *   - ndy         → Not Done Yet, $195/mo. Ongoing coaching + community
 *                   for riders who need a feedback loop, not more reading.
 *   - innerCircle → The Roadman Inner Circle, $525/mo. Premium 1:1 for
 *                   riders whose answers lit up several systems at once.
 *
 * Routing is driven entirely by the diagnostic responses: the scored
 * profiles (recomputed from the stored answers), whether a secondary
 * limiter is in play, the severe-multi-system flag, and retake history.
 */

import { computeScores } from "./scoring";
import { PROFILE_LABELS } from "./profiles";
import type { Answers, Profile } from "./types";

export type ProductPath = "method" | "ndy" | "innerCircle";

/** A profile is a "serious" limiter once it clears two-thirds of its 0–9 range. */
const SERIOUS_THRESHOLD = 6;

/**
 * The minimal shape the router needs. `StoredSubmission` satisfies it
 * structurally, so the results page can hand its submission straight in
 * without this module importing the DB layer.
 */
export interface RoutingInput {
  primaryProfile: Profile;
  secondaryProfile: Profile | null;
  severeMultiSystem: boolean;
  closeToBreakthrough: boolean;
  answers: Answers;
  retakeNumber: number;
}

/** Profiles that scored as serious limiters (≥6), highest first. */
export function flaggedAreas(input: RoutingInput): Profile[] {
  const scores = computeScores(input.answers);
  return (Object.entries(scores) as Array<[Profile, number]>)
    .filter(([, v]) => v >= SERIOUS_THRESHOLD)
    .sort(([, a], [, b]) => b - a)
    .map(([p]) => p);
}

/** A limiter has to clear this to count as a genuine, coach-worthy gap. */
const MODERATE_THRESHOLD = 4;

/**
 * The routing decision. Read top-to-bottom; first match wins.
 *
 *   1. Several systems failing at once → Inner Circle. Multiple serious
 *      limiters (or the severe-multi-system flag) can't be read away with
 *      a course; they need the whole picture managed.
 *   2. Not really plateaued → The Method. Close-to-breakthrough riders
 *      have the fundamentals in place; hand them the system to lock it in,
 *      not an ongoing subscription. This is checked before the co-limiter
 *      rule on purpose — when every profile sits low and tied, scoring
 *      reports a "secondary" that isn't a real second limiter.
 *   3. A feedback-loop need → Not Done Yet:
 *        - two genuine co-limiters (a secondary that's itself at least a
 *          moderate gap) — needs a coach to balance both, not a syllabus, or
 *        - a behavioural primary limiter — under-recovery or fuelling —
 *          that's serious, where the fix is someone reviewing the week,
 *          not more information, or
 *        - a repeat taker who's still stuck (self-serve already didn't land).
 *   4. Otherwise → The Method. A single, clear, structural gap
 *      (no-man's-land or a strength gap, or any one moderate limiter) is
 *      exactly what a 12-week system fixes.
 */
export function recommendProduct(input: RoutingInput): ProductPath {
  const areas = flaggedAreas(input);

  if (input.severeMultiSystem || areas.length >= 3) return "innerCircle";

  if (input.closeToBreakthrough) return "method";

  const scores = computeScores(input.answers);
  const primaryScore = scores[input.primaryProfile];
  const secondaryScore = input.secondaryProfile
    ? scores[input.secondaryProfile]
    : 0;
  const primaryIsBehavioural =
    input.primaryProfile === "underRecovered" ||
    input.primaryProfile === "fuelingDeficit";

  const twoGenuineLimiters =
    input.secondaryProfile !== null &&
    primaryScore >= MODERATE_THRESHOLD &&
    secondaryScore >= MODERATE_THRESHOLD;

  if (twoGenuineLimiters) return "ndy";
  if (primaryIsBehavioural && primaryScore >= SERIOUS_THRESHOLD) return "ndy";
  if (input.retakeNumber >= 2 && areas.length >= 1) return "ndy";

  return "method";
}

/* ─── Personalised callout phrasing ──────────────────────────── */

/**
 * A short, lower-case clause describing the rider's gap, written to drop
 * into the middle of a sentence. Keeps the recommendation specific to
 * THEIR result rather than generic product copy.
 */
const GAP_PHRASE: Record<Profile, string> = {
  underRecovered:
    "your body isn't absorbing the training you're already doing",
  polarisation:
    "most of your week sits in the grey zone — neither easy enough to recover nor hard enough to build",
  strengthGap:
    "your top-end power is leaking away while the aerobic engine holds",
  fuelingDeficit:
    "you're paying for every session with tomorrow's adaptation",
};

const CLOSE_TO_BREAKTHROUGH_GAP =
  "the fundamentals are mostly in place — the stall is something narrow and specific";

function gapPhrase(input: RoutingInput): string {
  return input.closeToBreakthrough
    ? CLOSE_TO_BREAKTHROUGH_GAP
    : GAP_PHRASE[input.primaryProfile];
}

/**
 * The lead line on the recommendation card — references the rider's own
 * diagnosis, then names why this specific product fits it.
 */
export function buildCallout(input: RoutingInput, path: ProductPath): string {
  const gap = gapPhrase(input);

  if (path === "method") {
    return `Your diagnostic points to one clear thing: ${gap}. The Roadman Method is a 12-week system built to fix exactly that — in order, at your own pace, no guessing about what to do next.`;
  }

  if (path === "ndy") {
    return `Your diagnostic shows ${gap}. What's missing here isn't another plan to read — it's a feedback loop: someone reviewing your week, every week, and telling you the one thing to change.`;
  }

  // innerCircle
  const areas = flaggedAreas(input);
  const labels = (areas.length >= 2 ? areas : [input.primaryProfile]).map(
    (p) => PROFILE_LABELS[p],
  );
  const list = formatList(labels);
  return `Your diagnostic flagged ${list} — more than one system, all at once. That's not a single fix you can read your way out of. It needs eyes on the whole picture, week to week.`;
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/* ─── Product content ────────────────────────────────────────── */

export interface ProductContent {
  path: ProductPath;
  /** Eyebrow above the recommendation. */
  eyebrow: string;
  /** Product name as shown in the heading. */
  name: string;
  /** One-line description of what it is. */
  blurb: string;
  /** Headline price, USD. */
  price: string;
  /** Unit / terms under the price. */
  priceUnit: string;
  /** 3–4 brief "what's included" lines. */
  includes: readonly string[];
  /** Single social-proof line. */
  socialProof: string;
  /** CTA button label. */
  ctaLabel: string;
  /** CTA destination. */
  href: string;
  /** Whether the CTA is an off-site link (skool). */
  external: boolean;
  /** data-cta tag for analytics attribution. */
  ctaTag: string;
  /** Restated reassurance under the final CTA, product-appropriate. */
  riskReversal: string;
  /** Closing line for the "your next move" section. */
  finalNudge: string;
}

const SKOOL_URL = "https://www.skool.com/roadmancycling";

export const PRODUCT_CONTENT: Record<ProductPath, ProductContent> = {
  method: {
    path: "method",
    eyebrow: "THE SYSTEM BUILT FOR THIS",
    name: "The Roadman Method",
    blurb:
      "A 12-week structured system you run yourself — the whole framework, in order, start to finish.",
    price: "$297",
    priceUnit: "one payment · lifetime access",
    includes: [
      "12 video lessons with Anthony, plus written companion guides and worksheets",
      "A TrainingPeaks plan for every block — load it and ride",
      "All five pillars covered properly: coaching, nutrition, S&C, recovery, le métier",
      "One payment, kept for life. 30-day full refund, no interrogation.",
    ],
    socialProof:
      "Built from 300+ on-the-record interviews with the coaches the World Tour actually uses.",
    ctaLabel: "Get The Method",
    href: "/method/checkout",
    external: false,
    ctaTag: "product-method",
    riskReversal:
      "One payment, yours for life. 30-day full refund if it isn't the structure you needed — a one-line email is enough.",
    finalNudge:
      "You don't need more information. You need it in the right order, with a plan you can load and ride this week. That's the Method.",
  },

  ndy: {
    path: "ndy",
    eyebrow: "THE COACHING BUILT FOR THIS",
    name: "Not Done Yet",
    blurb:
      "Ongoing coaching and community — someone reviewing your file every week, not a plan you read once and forget.",
    price: "$195",
    priceUnit: "per month USD · 7-day free trial",
    includes: [
      "Weekly coaching call with Anthony — your week reviewed, next week planned",
      "A personalised TrainingPeaks plan, rewritten as you progress",
      "Nutrition, S&C and recovery oversight sitting alongside the plan",
      "A private community of serious riders. Cancel anytime, no contracts.",
    ],
    socialProof:
      "100+ serious riders are inside Not Done Yet right now — Cat 3s chasing Cat 1, masters chasing PBs. Not beginners, not a ghost town.",
    ctaLabel: "Try Not Done Yet free for 7 days",
    href: SKOOL_URL,
    external: true,
    ctaTag: "product-ndy",
    riskReversal:
      "Seven days free. Cancel anytime, no contracts — you only continue if it's working.",
    finalNudge:
      "Reading won't break this one. A feedback loop will — someone watching the file every week and calling the change before you make the same mistake again.",
  },

  innerCircle: {
    path: "innerCircle",
    eyebrow: "THE 1:1 BUILT FOR THIS",
    name: "The Roadman Inner Circle",
    blurb:
      "Premium 1:1 for riders with more than one system to fix — the whole picture managed, not handed to you.",
    price: "$525",
    priceUnit: "per month USD · application only",
    includes: [
      "Weekly 1:1 calls with Anthony — your file, not a group call",
      "Blood work analysis and daily macro monitoring",
      "A TrainingPeaks plan written, watched and adjusted for you",
      "Everything inside Not Done Yet, plus a direct line when you need it",
    ],
    socialProof:
      "A small room by design — Anthony works with a limited number of riders 1:1 at this level.",
    ctaLabel: "Apply for the Inner Circle",
    href: "/inner-circle",
    external: false,
    ctaTag: "product-inner-circle",
    riskReversal:
      "Application only — a short conversation first, so we both know it's the right fit before you commit.",
    finalNudge:
      "More than one system is failing at once. That's not a course or a calendar — it's the whole picture, managed by someone who can see all of it.",
  },
};

export interface ProductRecommendation {
  path: ProductPath;
  product: ProductContent;
  /** Personalised lead line referencing the rider's own diagnosis. */
  callout: string;
}

/**
 * One-shot resolver the results page calls: decides the path and bundles
 * the product content with the personalised callout.
 */
export function getProductRecommendation(
  input: RoutingInput,
): ProductRecommendation {
  const path = recommendProduct(input);
  return {
    path,
    product: PRODUCT_CONTENT[path],
    callout: buildCallout(input, path),
  };
}
