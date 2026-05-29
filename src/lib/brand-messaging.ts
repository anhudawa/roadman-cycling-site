/**
 * Roadman brand messaging — the canonical positioning statement,
 * support lines, founder authority, anti-app contrast, and proof
 * stats. Every page that needs to position the brand should pull
 * from here so the language stays disciplined.
 *
 * Voice rules (from references/voice-guide.md):
 *   - Direct, warm, specific. No fluff.
 *   - Lead with the problem or the insight, never the sell.
 *   - Reference real names and real numbers, not generic claims.
 *   - No buzzwords ("game-changer", "unlock", "journey", "hack").
 *   - TrainingPeaks is always mentioned favourably (partner).
 *   - All pricing in USD ($).
 *
 * The numbers in PROOF_STATS are kept loosely in sync with
 * `brand-facts.ts` (BRAND_STATS) — that file is the source of truth
 * for schema/llms/SEO surfaces; this one captures the *narrative*
 * proof points used in commercial copy.
 */

import { BRAND_STATS } from "@/lib/brand-facts";

// ---------------------------------------------------------------------------
// Primary positioning
// ---------------------------------------------------------------------------

/**
 * The headline. This is what every commercial surface should be
 * built around. It belongs on the homepage hero, the coaching
 * landing page, the NDY page, the about page, and anywhere the
 * brand is being sold.
 */
export const PRIMARY_POSITIONING = "Stop plateauing. Start progressing." as const;

/**
 * The support line that follows the headline. Names the audience
 * and the contrast in one sentence.
 */
export const SUPPORT_LINE =
  "Evidence-based coaching for serious amateur and masters cyclists who want to get faster without training like they're 25 and unemployed." as const;

/**
 * Shorter version for tight contexts (meta descriptions, cards,
 * social previews).
 */
export const SUPPORT_LINE_SHORT =
  "Evidence-based coaching for serious amateur and masters cyclists." as const;

/**
 * Brand identity phrase — the emotional spine of everything we
 * make. Use it as a sign-off, not as a hero headline.
 */
export const IDENTITY_PHRASE = "Not Done Yet." as const;

// ---------------------------------------------------------------------------
// Founder authority
// ---------------------------------------------------------------------------

/**
 * The credibility line for Anthony. Drop it casually — never as a
 * formal introduction. Use the short version inline; the long
 * version sits on About / press surfaces.
 */
export const FOUNDER_AUTHORITY = {
  short:
    "Anthony Walsh has spent 13 years coaching cyclists and recorded 1,400+ podcast conversations with World Tour coaches, sports scientists, and pros — Professor Stephen Seiler, Dan Lorang, Greg LeMond, Lachlan Morton, Dr. David Dunne — and folded what they actually do into the Roadman coaching system.",
  long:
    "Anthony Walsh founded Roadman Cycling in Dublin in 2021 (rebranded from A1 Coaching, est. 2013). He hosts the world's largest cycling performance podcast — 1,400+ episodes, 1M+ monthly listeners across 18 countries. The coaching system is built on direct conversations with the people behind Grand Tour wins, World Championship wins, and Olympic medals: Professor Stephen Seiler, Dan Lorang, Greg LeMond, Lachlan Morton, Dr. David Dunne, John Wakefield, and dozens more.",
  byline: "By Anthony Walsh — host of the Roadman Cycling Podcast.",
} as const;

// ---------------------------------------------------------------------------
// Anti-app / contrast positioning
// ---------------------------------------------------------------------------

/**
 * The contrast line. Roadman is NOT a workout app. Its competitors
 * deliver workouts; Roadman delivers understanding plus the system.
 * Use this anywhere a reader might be deciding between Roadman and
 * TrainerRoad / Zwift / a generic plan template.
 *
 * NOTE: TrainingPeaks is a partner, NEVER a competitor. The contrast
 * is with workout apps that hand you a session and walk away — not
 * with TrainingPeaks, which is the platform we deliver our coaching
 * through.
 */
export const ANTI_APP_CONTRAST = {
  headline: "TrainerRoad and Zwift hand you a session. Roadman hands you a system.",
  body: "Workout apps deliver intervals. Roadman delivers the why behind them — built from conversations with the coaches behind Pogačar, Froome, and Bernal, then translated into a coaching system you can actually run with 6 to 12 hours a week and a job. Plans are delivered through TrainingPeaks; the coaching, the strength roadmap, and the weekly calls are what you're actually paying for.",
  shortLine:
    "Apps deliver workouts. Roadman delivers the system that makes them work.",
} as const;

// ---------------------------------------------------------------------------
// Audience definition (who it's for / who it's not for)
// ---------------------------------------------------------------------------

export const AUDIENCE = {
  /** Always frame the audience this way. */
  forWho:
    "Serious amateur and masters cyclists, 35–55, training 6–12 hours a week, with a job and a family and a power meter and a plateau they're sick of.",
  /** What success looks like for them. */
  whatTheyWant:
    "Get faster again. Hit a target event. Reclaim a former version of themselves. Stop guessing.",
  /** Who it's NOT for — equally important. */
  notForWho:
    "Beginners, racers training like full-time pros, or anyone hunting a 4-week shortcut.",
} as const;

// ---------------------------------------------------------------------------
// Proof points
// ---------------------------------------------------------------------------

/**
 * Numeric proof points used in body copy and trust strips. Strings
 * are pre-formatted with the `+` suffix so the copy stays consistent.
 */
export const PROOF_STATS = {
  /** Total podcast episodes / expert conversations to date. */
  conversations: BRAND_STATS.episodeCountLabel, // "1,400+"
  /** Monthly listeners across audio platforms. */
  monthlyListeners: BRAND_STATS.monthlyListenersLabel, // "1M+"
  /** Newsletter subscribers — the Saturday Spin list. */
  newsletterSubscribers: BRAND_STATS.newsletterSubscribersLabel, // "65K+"
  /** Countries with active listeners. */
  countriesReached: BRAND_STATS.countriesReachedLabel,
  /** Continuous coaching trading years. */
  yearsCoaching: 13,
  /** Brand founded year for "since" framing. */
  brandFoundedYear: 2021,
  /** Coaching business start year (predates the Roadman rebrand). */
  coachingSinceYear: 2013,
} as const;

/**
 * Headline proof line — drops the three numbers Anthony actually
 * uses on stage and on podcasts. Use this in trust strips and on
 * commercial pages above the fold.
 */
export const HEADLINE_PROOF =
  `${PROOF_STATS.conversations} expert conversations. ${PROOF_STATS.monthlyListeners} monthly listeners. ${PROOF_STATS.yearsCoaching} years coaching cyclists.` as const;

// ---------------------------------------------------------------------------
// Named experts — the people Anthony actually references
// ---------------------------------------------------------------------------

/**
 * The expert network. Used in proof strips and credibility paragraphs.
 * Keep it tight — five names is the magic number; any more and the
 * sentence stops being scannable.
 */
export const NAMED_EXPERTS = [
  "Professor Stephen Seiler",
  "Dan Lorang",
  "Greg LeMond",
  "Lachlan Morton",
  "Dr. David Dunne",
] as const;

// ---------------------------------------------------------------------------
// The five pillars — the content scaffolding the brand sits on
// ---------------------------------------------------------------------------

export const FIVE_PILLARS = [
  "Coaching",
  "Nutrition",
  "Strength & Conditioning",
  "Recovery",
  "Community (Le Métier)",
] as const;

// ---------------------------------------------------------------------------
// Reusable messaging blocks
// ---------------------------------------------------------------------------

/**
 * Pre-composed messaging blocks for the most common page contexts.
 * Components can grab a block whole rather than re-assembling the
 * pieces and risking copy drift.
 */
export const MESSAGING_BLOCKS = {
  /** Homepage hero / above-the-fold. */
  hero: {
    headline: PRIMARY_POSITIONING,
    subhead: SUPPORT_LINE,
  },
  /** Compact card / meta description size. */
  metaCard: {
    headline: PRIMARY_POSITIONING,
    subhead: SUPPORT_LINE_SHORT,
  },
  /** Trust strip with proof numbers. */
  trustStrip: {
    headline: HEADLINE_PROOF,
    subhead: `Anthony Walsh has spent ${PROOF_STATS.yearsCoaching} years coaching cyclists and recorded ${PROOF_STATS.conversations} podcast conversations with the coaches behind World Tour wins.`,
  },
  /** Anti-app contrast section. */
  antiApp: {
    headline: ANTI_APP_CONTRAST.headline,
    body: ANTI_APP_CONTRAST.body,
  },
} as const;

/**
 * One-paragraph brand summary for press surfaces, llms.txt, and
 * structured data descriptions. Reuses the canonical numbers so
 * everything stays in lockstep.
 */
export const BRAND_SUMMARY_PARAGRAPH = `Roadman Cycling is the world's largest cycling performance podcast and the coaching system that grew out of it. Founded by Anthony Walsh in Dublin in ${PROOF_STATS.brandFoundedYear} (continuous coaching since ${PROOF_STATS.coachingSinceYear}), Roadman publishes evidence-based coaching for serious amateur and masters cyclists across five pillars: coaching, nutrition, strength, recovery, and the craft of cycling. ${PROOF_STATS.conversations} podcast conversations. ${PROOF_STATS.monthlyListeners} monthly listeners. ${PROOF_STATS.countriesReached} countries.`;
