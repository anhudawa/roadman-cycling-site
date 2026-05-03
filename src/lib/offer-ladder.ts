/**
 * The Roadman Offer Ladder — single source of truth for the four
 * commercial tiers, the routes that represent them, and the CTA copy
 * used to move people up the ladder.
 *
 * The ladder is the spine of the entire site. Every commercial CTA and
 * navigation surface should derive its labels and routes from here.
 *
 * Naming discipline (load-bearing — do NOT relax):
 *   - Not Done Yet         = "coaching" (NEVER community / membership / club / cohort)
 *   - Saturday Spin        = "newsletter"
 *   - Plateau Diagnostic   = "lead magnet" / segmentation tool
 *   - Clubhouse            = "free community"
 *   - 1:1 Coaching         = premium / bespoke / application-based
 */

export type OfferTierId =
  | "free"
  | "plateau-diagnostic"
  | "not-done-yet"
  | "one-to-one";

/**
 * Surface intent for CTA selection. Pages declare which surface they
 * are; the right primary/secondary CTA falls out of the ladder
 * automatically.
 */
export type OfferSurface =
  | "cold"        // Homepage, ungated SEO landing pages, glossary
  | "content"     // Blog, podcast episodes, guides, topic hubs
  | "commercial"  // /coaching, NDY page, comparison pages
  | "premium";    // /apply, premium pages, high-intent surfaces

export interface OfferPricing {
  kind: "free" | "subscription" | "application";
  /** Headline price label, e.g. "$195/month", "Free", "By application". */
  display: string;
  /** Numeric monthly price in USD where applicable. */
  monthlyUsd?: number;
  /** Annual equivalent (USD) where applicable. */
  annualUsd?: number;
  /** Trial copy if a free trial applies. */
  trial?: string;
}

export interface OfferCta {
  label: string;
  href: string;
  /** Short label for tight contexts (mobile nav, inline buttons). */
  shortLabel?: string;
  /** Aria/title fallback when used outside body copy. */
  ariaLabel?: string;
}

export interface OfferTier {
  id: OfferTierId;
  /** One-word label used in nav and chips. */
  label: string;
  /** Full product name as it appears in headlines. */
  name: string;
  /** What it is, in one sentence Anthony would actually say. */
  oneLiner: string;
  /** Slightly longer description for cards and section heads. */
  description: string;
  /** What this tier is — strict noun discipline. */
  productKind: "free content" | "lead magnet" | "coaching" | "1:1 coaching";
  /** Primary CTA for this tier. */
  cta: OfferCta;
  /** Secondary CTA when the primary isn't appropriate. */
  secondaryCta?: OfferCta;
  /** Pricing detail. */
  pricing: OfferPricing;
  /** Canonical route that represents the tier. */
  route: string;
}

// ---------------------------------------------------------------------------
// Tier 1 — Free content (podcast, Saturday Spin, guides, tools, Clubhouse)
// ---------------------------------------------------------------------------
const TIER_FREE: OfferTier = {
  id: "free",
  label: "Free",
  name: "Free Roadman",
  oneLiner:
    "The podcast, Saturday Spin newsletter, written guides, browser tools, and the Clubhouse free community.",
  description:
    "Everything Roadman publishes in the open: 1,400+ podcast episodes, the Saturday Spin newsletter, free browser-based calculators, written guides, and the Clubhouse free community.",
  productKind: "free content",
  cta: {
    label: "Start Here",
    shortLabel: "Start Here",
    href: "/start-here",
  },
  secondaryCta: {
    label: "Join Saturday Spin",
    shortLabel: "Saturday Spin",
    href: "/newsletter",
  },
  pricing: { kind: "free", display: "Free" },
  route: "/start-here",
};

// ---------------------------------------------------------------------------
// Tier 2 — Plateau Diagnostic (lead magnet / segmentation tool)
// ---------------------------------------------------------------------------
const TIER_PLATEAU_DIAGNOSTIC: OfferTier = {
  id: "plateau-diagnostic",
  label: "Plateau Diagnostic",
  name: "The Plateau Diagnostic",
  oneLiner:
    "A short diagnostic that pinpoints why you're plateaued and the one thing to do about it next.",
  description:
    "A 5-minute diagnostic that surfaces the real reason your training has stalled and routes you to the next step that will actually unstick you. Free.",
  productKind: "lead magnet",
  cta: {
    label: "Take the Plateau Diagnostic",
    shortLabel: "Plateau Diagnostic",
    href: "/plateau",
  },
  pricing: { kind: "free", display: "Free" },
  route: "/plateau",
};

// ---------------------------------------------------------------------------
// Tier 3 — Not Done Yet (COACHING — the core paid product)
// ---------------------------------------------------------------------------
const TIER_NOT_DONE_YET: OfferTier = {
  id: "not-done-yet",
  label: "Not Done Yet",
  name: "Not Done Yet Coaching",
  oneLiner:
    "Anthony's coaching system for serious amateur and masters cyclists — personalised plans, weekly calls, the full method.",
  description:
    "The Roadman coaching system delivered as a monthly programme: personalised TrainingPeaks plans, weekly coaching calls with Anthony, the cycling-specific strength roadmap, race-weight and fuelling guidance, and ongoing 1:1 plan reviews. Built for cyclists who are training 6–12 hours a week and aren't done yet.",
  productKind: "coaching",
  cta: {
    label: "Join Not Done Yet",
    shortLabel: "Join NDY",
    href: "/community/not-done-yet",
  },
  pricing: {
    kind: "subscription",
    display: "$195/month",
    monthlyUsd: 195,
    trial: "7-day free trial",
  },
  route: "/community/not-done-yet",
};

// ---------------------------------------------------------------------------
// Tier 4 — 1:1 Coaching (premium, application-based, bespoke)
// ---------------------------------------------------------------------------
const TIER_ONE_TO_ONE: OfferTier = {
  id: "one-to-one",
  label: "1:1 Coaching",
  name: "1:1 Coaching with Anthony",
  oneLiner:
    "Direct 1:1 coaching with Anthony — bespoke programming, direct access, and quarterly strategy calls. Application only.",
  description:
    "For cyclists who want the full Roadman system with direct 1:1 access to Anthony: bespoke programming, quarterly strategy calls, priority event support, and a single line of accountability. Application-based, limited spots.",
  productKind: "1:1 coaching",
  cta: {
    label: "Apply for 1:1 Coaching",
    shortLabel: "Apply",
    href: "/apply",
  },
  pricing: {
    kind: "application",
    display: "By application",
    annualUsd: 1950,
  },
  route: "/apply",
};

export const OFFER_TIERS = {
  free: TIER_FREE,
  plateauDiagnostic: TIER_PLATEAU_DIAGNOSTIC,
  notDoneYet: TIER_NOT_DONE_YET,
  oneToOne: TIER_ONE_TO_ONE,
} as const;

/**
 * The four tiers in ladder order. Iterate this for ladder overviews,
 * pricing comparisons, and step-by-step diagrams.
 */
export const OFFER_LADDER: readonly OfferTier[] = [
  TIER_FREE,
  TIER_PLATEAU_DIAGNOSTIC,
  TIER_NOT_DONE_YET,
  TIER_ONE_TO_ONE,
] as const;

// ---------------------------------------------------------------------------
// CTA hierarchy by surface
// ---------------------------------------------------------------------------

/**
 * The CTA hierarchy. Each surface has a primary CTA (the conversion
 * target) and a secondary CTA (the soft alternative when the user
 * isn't ready for the primary action).
 *
 * Use `getPrimaryCtaForSurface(surface)` rather than hardcoding CTAs
 * in components. This keeps the ladder consistent across hundreds of
 * pages.
 */
export const SURFACE_CTAS: Record<
  OfferSurface,
  { primary: OfferCta; secondary?: OfferCta }
> = {
  cold: {
    primary: TIER_PLATEAU_DIAGNOSTIC.cta,
    secondary: { label: "Listen to the podcast", href: "/podcast" },
  },
  content: {
    primary: TIER_PLATEAU_DIAGNOSTIC.cta,
    secondary: TIER_FREE.secondaryCta,
  },
  commercial: {
    primary: TIER_NOT_DONE_YET.cta,
    secondary: TIER_PLATEAU_DIAGNOSTIC.cta,
  },
  premium: {
    primary: TIER_ONE_TO_ONE.cta,
    secondary: TIER_NOT_DONE_YET.cta,
  },
};

export function getPrimaryCtaForSurface(surface: OfferSurface): OfferCta {
  return SURFACE_CTAS[surface].primary;
}

export function getSecondaryCtaForSurface(
  surface: OfferSurface,
): OfferCta | undefined {
  return SURFACE_CTAS[surface].secondary;
}

// ---------------------------------------------------------------------------
// Free-tier surfaces (the things INSIDE tier 1)
// ---------------------------------------------------------------------------

/**
 * The free-tier is plural — it's not one product, it's a portfolio of
 * free surfaces. Components that need to enumerate "what's free" pull
 * from this list.
 */
export interface FreeSurface {
  id: "podcast" | "saturday-spin" | "guides" | "tools" | "clubhouse";
  /** Display name. Saturday Spin is "newsletter", Clubhouse is "free community". */
  name: string;
  /** Strict noun — what this thing IS. */
  kind: "podcast" | "newsletter" | "guides" | "tools" | "free community";
  description: string;
  href: string;
}

export const FREE_SURFACES: readonly FreeSurface[] = [
  {
    id: "podcast",
    name: "The Roadman Cycling Podcast",
    kind: "podcast",
    description:
      "1,400+ episodes with World Tour coaches, sports scientists, pros, and the people inside cycling.",
    href: "/podcast",
  },
  {
    id: "saturday-spin",
    name: "The Saturday Spin",
    kind: "newsletter",
    description:
      "The week's sharpest cycling insights, every Saturday — straight from the podcast.",
    href: "/newsletter",
  },
  {
    id: "guides",
    name: "Written guides",
    kind: "guides",
    description:
      "Long-form, evidence-based articles across the five pillars: training, nutrition, strength, recovery, and the craft of cycling.",
    href: "/blog",
  },
  {
    id: "tools",
    name: "Free browser tools",
    kind: "tools",
    description:
      "FTP zones, HR zones, W/kg, race weight, in-ride fuelling, tyre pressure, and the rest of the toolkit.",
    href: "/tools",
  },
  {
    id: "clubhouse",
    name: "The Clubhouse",
    kind: "free community",
    description:
      "The free Roadman community — weekly live Q&A with Anthony, training questions, and 1,800+ riders working through the same problems.",
    href: "/community/clubhouse",
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getTier(id: OfferTierId): OfferTier {
  const match = OFFER_LADDER.find((t) => t.id === id);
  if (!match) {
    throw new Error(`Unknown offer tier: ${id}`);
  }
  return match;
}

/**
 * Always return the canonical product name for a tier — useful when
 * authoring copy programmatically and you want to guarantee the
 * naming discipline survives.
 */
export function tierName(id: OfferTierId): string {
  return getTier(id).name;
}
