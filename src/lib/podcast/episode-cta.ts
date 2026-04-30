/**
 * Episode CTA router. Picks the most commercially relevant call-to-action
 * for an episode based on its topic tags and pillar.
 *
 * Returned spec is consumed by `<EpisodeCta variant=… />` in the page
 * right rail. The current page renders a single generic newsletter CTA;
 * over time the variants below get bespoke components and copy. Until
 * then, callers should fall back to the newsletter variant if the
 * specific component isn't implemented yet — `getEpisodeCta()` always
 * returns a valid spec, never null.
 *
 * Mapping reflects Roadman's owned conversion paths:
 *   - FTP / masters / coaching topics → "Not Done Yet" Skool community
 *     (highest LTV — Standard /mo, Premium /mo, VIP ,950/yr)
 *   - Strength topics → Strength Training course (.99) — proven seller
 *   - Nutrition topics → Free Toolkit + nutrition email sequence (lead-gen)
 *   - Recovery topics → Newsletter + recovery toolkit (gentler entry)
 *   - Default → Newsletter signup
 */

import { type EpisodeMeta } from "@/lib/podcast";
import { type ContentPillar } from "@/types";

export type EpisodeCtaVariant =
  | "community"
  | "strength-course"
  | "toolkit-nutrition"
  | "newsletter-recovery"
  | "newsletter";

export interface EpisodeCtaSpec {
  variant: EpisodeCtaVariant;
  /** Headline copy. Identity-led where possible (per brand voice). */
  headline: string;
  /** Sub-headline / supporting copy. Direct, no fluff. */
  body: string;
  /** Button label. Action-oriented. */
  cta: string;
  /** Destination URL. Internal canonical link. */
  href: string;
  /** Why this episode got this CTA — surfaced in audit reports, not on page. */
  reason: string;
}

const VARIANTS: Record<EpisodeCtaVariant, Omit<EpisodeCtaSpec, "reason">> = {
  community: {
    variant: "community",
    headline: "Stop guessing. Plug into Not Done Yet.",
    body: "Weekly calls with Anthony, Vekta-built training plans, and a community of serious cyclists who refuse to accept their best days are behind them.",
    cta: "Join Not Done Yet",
    href: "/community",
  },
  "strength-course": {
    variant: "strength-course",
    headline: "Build the strength your training is missing.",
    body: "The Roadman Strength Training programme — built for cyclists, designed to make you faster on the bike without breaking your weekly hours.",
    cta: "Get the strength programme",
    href: "/products/strength-training",
  },
  "toolkit-nutrition": {
    variant: "toolkit-nutrition",
    headline: "Get the fueling right and the watts follow.",
    body: "Grab the free Roadman Toolkit — carbs-per-hour calculator, race weight guide, and the nutrition cheatsheet 8,000+ riders use.",
    cta: "Download the toolkit",
    href: "/toolkit",
  },
  "newsletter-recovery": {
    variant: "newsletter-recovery",
    headline: "The week's most useful cycling read.",
    body: "Recovery, longevity, and the science of riding into your 60s — distilled for serious amateurs. One email, no fluff.",
    cta: "Subscribe to the newsletter",
    href: "/newsletter",
  },
  newsletter: {
    variant: "newsletter",
    headline: "Cycling is hard. Our newsletter helps.",
    body: "Training, nutrition, and the conversations behind the podcast — written for cyclists who care about getting better.",
    cta: "Subscribe to the newsletter",
    href: "/newsletter",
  },
};

const COMMUNITY_TOPICS: ReadonlySet<string> = new Set([
  "ftp",
  "ftp-training",
  "ftp-test",
  "increase-ftp",
  "masters",
  "masters-cycling",
  "over-40",
  "over-50",
  "coaching",
  "cycling-coaching",
  "training-plans",
  "polarised-training",
  "sweet-spot-training",
  "zone-2",
]);

const STRENGTH_TOPICS: ReadonlySet<string> = new Set([
  "strength",
  "strength-training",
  "s-and-c",
  "injury-prevention",
]);

const NUTRITION_TOPICS: ReadonlySet<string> = new Set([
  "nutrition",
  "cycling-nutrition",
  "fueling",
  "race-weight",
  "weight-loss",
  "carbs-per-hour",
  "hydration",
]);

const RECOVERY_TOPICS: ReadonlySet<string> = new Set([
  "recovery",
  "sleep",
  "longevity",
  "stress",
]);

function tagsHit(
  tags: string[] | undefined,
  set: ReadonlySet<string>,
): string | null {
  if (!tags) return null;
  for (const t of tags) {
    if (set.has(t)) return t;
  }
  return null;
}

/**
 * Pick a CTA variant for an episode. Topic tags take precedence over
 * pillar, because tags are more specific (an episode in the "Coaching"
 * pillar might be specifically about recovery — we'd rather use
 * `recovery` tag → newsletter than the broader pillar).
 */
export function getEpisodeCta(ep: EpisodeMeta): EpisodeCtaSpec {
  const communityTag = tagsHit(ep.topicTags, COMMUNITY_TOPICS);
  if (communityTag) {
    return {
      ...VARIANTS.community,
      reason: `topic tag '${communityTag}' → community CTA`,
    };
  }

  const strengthTag = tagsHit(ep.topicTags, STRENGTH_TOPICS);
  if (strengthTag) {
    return {
      ...VARIANTS["strength-course"],
      reason: `topic tag '${strengthTag}' → strength course CTA`,
    };
  }

  const nutritionTag = tagsHit(ep.topicTags, NUTRITION_TOPICS);
  if (nutritionTag) {
    return {
      ...VARIANTS["toolkit-nutrition"],
      reason: `topic tag '${nutritionTag}' → toolkit CTA`,
    };
  }

  const recoveryTag = tagsHit(ep.topicTags, RECOVERY_TOPICS);
  if (recoveryTag) {
    return {
      ...VARIANTS["newsletter-recovery"],
      reason: `topic tag '${recoveryTag}' → recovery newsletter CTA`,
    };
  }

  return pillarFallback(ep.pillar);
}

function pillarFallback(pillar: ContentPillar): EpisodeCtaSpec {
  switch (pillar) {
    case "coaching":
      return { ...VARIANTS.community, reason: "coaching pillar fallback" };
    case "strength":
      return { ...VARIANTS["strength-course"], reason: "strength pillar fallback" };
    case "nutrition":
      return { ...VARIANTS["toolkit-nutrition"], reason: "nutrition pillar fallback" };
    case "recovery":
      return { ...VARIANTS["newsletter-recovery"], reason: "recovery pillar fallback" };
    default:
      return { ...VARIANTS.newsletter, reason: "default newsletter" };
  }
}
