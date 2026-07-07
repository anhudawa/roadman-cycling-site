/**
 * Quiz outcome → content recommendation map.
 *
 * The Plateau Diagnostic (`/plateau` → `/diagnostic/[slug]`) scores every
 * rider into one of four causal profiles (see `src/lib/diagnostic/types.ts`
 * and `src/lib/diagnostic/profiles.ts`): underRecovered, polarisation
 * ("no-man's-land"), strengthGap, and fuelingDeficit — plus a
 * closeToBreakthrough edge case when no profile scores strongly.
 *
 * These don't map 1:1 onto generic "plateau / injury-comeback / nutrition"
 * buckets — this diagnostic is specifically about *why an FTP has
 * stalled*, not injury recovery or general nutrition coaching — so this
 * map keys off the diagnostic's own real outcome identifiers rather than
 * inventing categories the quiz doesn't actually produce. Each entry
 * supplies 2-3 on-site links (topic hubs + tools) that give the rider
 * somewhere useful to go beyond the single product recommendation the
 * results page already pushes.
 *
 * Wired into `src/app/(marketing)/diagnostic/[slug]/page.tsx` — see the
 * "Keep reading" section, rendered after "THE FIX" and before the
 * testimonial/product pitch.
 */

import type { Profile } from "./diagnostic/types";

export interface ContentRecommendationLink {
  label: string;
  href: string;
}

export interface ContentRecommendation {
  /** Short heading for the recommendation block. */
  heading: string;
  links: ContentRecommendationLink[];
}

export type QuizOutcomeId = Profile | "closeToBreakthrough";

export const QUIZ_CONTENT_MAP: Record<QuizOutcomeId, ContentRecommendation> = {
  // Plateau / training-stagnation causes → coaching hub + FTP calculator.
  underRecovered: {
    heading: "KEEP READING",
    links: [
      { label: "Cycling Coaching — the complete guide", href: "/topics/cycling-coaching" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "Cycling Recovery — the complete guide", href: "/topics/cycling-recovery" },
    ],
  },
  polarisation: {
    heading: "KEEP READING",
    links: [
      { label: "Cycling Coaching — the complete guide", href: "/topics/cycling-coaching" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "Polarised Training — the 80/20 guide", href: "/topics/polarised-training" },
    ],
  },
  // Strength/neuromuscular gap → strength & conditioning hub.
  strengthGap: {
    heading: "KEEP READING",
    links: [
      { label: "Strength Training for Cyclists — the complete guide", href: "/topics/cycling-strength-conditioning" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
  // Fuelling/nutrition cause → nutrition hub + body composition content.
  fuelingDeficit: {
    heading: "KEEP READING",
    links: [
      { label: "Cycling Nutrition — the complete guide", href: "/topics/cycling-nutrition" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Race Weight Calculator", href: "/tools/race-weight" },
    ],
  },
  // No profile scored strongly — general coaching + FTP reading.
  closeToBreakthrough: {
    heading: "KEEP READING",
    links: [
      { label: "Cycling Coaching — the complete guide", href: "/topics/cycling-coaching" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
};

/**
 * `injury` / `comeback` recommendation, kept separate from
 * `QUIZ_CONTENT_MAP` because none of the Plateau Diagnostic's four scored
 * profiles represent an injury/comeback outcome. If a future quiz (or a
 * branch added to this one) produces a comeback/injury result, wire it up
 * with this shape: cross-training hub (cycling is lower-impact than
 * running) + recovery reading.
 */
export const INJURY_COMEBACK_RECOMMENDATION: ContentRecommendation = {
  heading: "KEEP READING",
  links: [
    { label: "Cycling for Runners — low-impact cross-training", href: "/topics/cycling-for-runners" },
    { label: "Cycling Recovery — the complete guide", href: "/topics/cycling-recovery" },
  ],
};

export function getContentRecommendation(
  outcome: QuizOutcomeId
): ContentRecommendation {
  return QUIZ_CONTENT_MAP[outcome];
}
