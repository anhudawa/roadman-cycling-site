/**
 * Deliberate budgets for the two LLM discovery documents.
 *
 * These routes are navigation and retrieval aids, not substitutes for the
 * complete sitemap, JSON feeds or knowledge graph. Keeping them bounded makes
 * the canonical owners and highest-value evidence visible before a crawler's
 * context or download budget is exhausted.
 */
export const LLMS_SHORT_RECENT_POST_LIMIT = 40;
export const LLMS_SHORT_EPISODE_LIMIT = 30;
export const LLMS_FULL_RECENT_POST_LIMIT = 300;
export const LLMS_FULL_EPISODE_LIMIT = 80;

export const LLMS_SHORT_MAX_BYTES = 150_000;
export const LLMS_FULL_MAX_BYTES = 500_000;

export const LLMS_PINNED_BLOG_SLUGS = new Set([
  "age-group-ftp-benchmarks-2026",
  "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
  "ironman-bike-training-plan-16-weeks",
  "polarised-vs-sweet-spot-training",
  "best-online-cycling-coach-how-to-choose",
  "is-a-cycling-coach-worth-it-case-study",
  "cycling-how-to-choose-a-training-plan-guide",
  "how-pro-cyclist-trains-60-days",
  "cycling-training-plan-build-friel-lorang-johnson",
  "joe-friel-perfect-cycling-training-week",
  "dylan-johnson-oscillation-training-plan",
  "best-cycling-podcasts-2026",
  "fast-talk-vs-cycling-podcast-vs-roadman",
  "how-to-structure-cycling-training-plan",
  "cycling-coach-vs-triathlon-coach",
  "zwift-vs-trainerroad",
  "wahoo-vs-garmin-cycling-computers",
  "fasted-vs-fueled-cycling",
  "zone-2-vs-endurance-training",
  "aero-vs-weight-cyclist",
  "tubeless-vs-clincher-tyres",
  "cycling-over-40-complete-guide",
  "cycling-training-plan-masters-over-40",
  "masters-cycling-training-plan-over-40",
  "polarised-training-cycling-complete-guide",
  "sweet-spot-training-cycling-guide",
  "bike-fit-guide-cyclists",
  "cycling-strength-training-guide",
  "best-cycling-computers-2026",
  "rouvy-vs-zwift",
  "cycling-energy-gels-guide",
  "cycling-in-ride-nutrition-guide",
  "cycling-stretching-routine",
  "cycling-tyre-pressure-guide",
  "cycling-in-rain-guide",
  "cycling-descending-wet-conditions-guide",
  "cycling-racing-in-the-rain-guide",
  "cycling-braking-technique-confidence-guide",
  "cornering-confidence-road-bike-technique",
  "heat-training-cyclists-30-watts-ftp-protocol",
  "cycling-heat-acclimation-protocol-guide",
  "cycling-heat-performance-adaptation-guide",
  "cycling-heat-illness-prevention-guide",
  "heat-tolerance-ageing-cyclist",
  "cycling-hydration-guide",
  "cycling-electrolytes-sweat-rate-testing-guide",
  "electrolytes-sweat-rate-cycling",
  "cycling-sodium-loading-hydration-guide",
  "cycling-cramp-prevention",
]);

/**
 * Keep every available pinned item, then add the newest non-pinned items up to
 * the requested limit. Input order is preserved within both groups and slugs
 * are emitted once.
 */
export function selectPriorityAndRecent<T extends { slug: string }>(
  items: readonly T[],
  recentLimit: number,
): T[] {
  const pinned = items.filter((item) => LLMS_PINNED_BLOG_SLUGS.has(item.slug));
  const recent = items
    .filter((item) => !LLMS_PINNED_BLOG_SLUGS.has(item.slug))
    .slice(0, recentLimit);

  return [...pinned, ...recent];
}
