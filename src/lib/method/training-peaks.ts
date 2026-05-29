/**
 * The Roadman Method — TrainingPeaks fulfilment resolver.
 *
 * Several modules expose a `kind: "training-peaks"` resource whose href is
 * `/method/training-peaks/<slug>` (see src/lib/method/modules.ts). Those slugs
 * are NOT module slugs — they're plan-block slugs (e.g. `polarised-base`,
 * `build-block`). This module is the single place that:
 *
 *   1. Collects the set of valid TrainingPeaks plan slugs from the module
 *      manifest, so the route can reject unknown slugs with notFound().
 *   2. Maps a plan slug → display info (the originating module + resource
 *      title) so the fulfilment page can show context without re-deriving it.
 *   3. Resolves the outbound TrainingPeaks plan URL for a Premium rider.
 *
 * Plan-URL resolution (Premium only), in priority order:
 *   1. Per-slug env var:  METHOD_TRAININGPEAKS_PLAN_URL_<SLUG_UPPER_SNAKE>
 *      e.g. slug `polarised-base` → METHOD_TRAININGPEAKS_PLAN_URL_POLARISED_BASE
 *   2. General fallback:  METHOD_TRAININGPEAKS_PLAN_URL
 *   3. null — nothing configured yet; the page shows an honest "being built"
 *      state. We never fabricate a TrainingPeaks URL.
 */

import { METHOD_MODULES, type MethodModule } from "./modules";

const TRAINING_PEAKS_PREFIX = "/method/training-peaks/";

export interface TrainingPeaksPlan {
  /** Plan-block slug, e.g. "polarised-base". */
  slug: string;
  /** Resource title from the module manifest, e.g. "Premium plan — Polarised Base Block". */
  title: string;
  /** The module this plan is attached to (for back-links + context). */
  module: MethodModule;
}

/**
 * Build the plan registry by scanning every module's training-peaks resources.
 * Computed once at module load — the manifest is static.
 */
const PLAN_BY_SLUG: ReadonlyMap<string, TrainingPeaksPlan> = (() => {
  const map = new Map<string, TrainingPeaksPlan>();
  for (const mod of METHOD_MODULES) {
    for (const resource of mod.resources) {
      if (resource.kind !== "training-peaks") continue;
      if (!resource.href.startsWith(TRAINING_PEAKS_PREFIX)) continue;
      const slug = resource.href.slice(TRAINING_PEAKS_PREFIX.length);
      if (!slug || map.has(slug)) continue;
      map.set(slug, { slug, title: resource.title, module: mod });
    }
  }
  return map;
})();

/** Resolve a plan slug → plan info, or null if the slug is unknown. */
export function getTrainingPeaksPlan(slug: string): TrainingPeaksPlan | null {
  return PLAN_BY_SLUG.get(slug) ?? null;
}

/** All valid TrainingPeaks plan slugs (for static params / debugging). */
export function getTrainingPeaksPlanSlugs(): string[] {
  return [...PLAN_BY_SLUG.keys()];
}

/**
 * Convert a plan slug to the per-slug env var key, e.g.
 * "polarised-base" → "METHOD_TRAININGPEAKS_PLAN_URL_POLARISED_BASE".
 */
export function planUrlEnvKey(slug: string): string {
  const suffix = slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return `METHOD_TRAININGPEAKS_PLAN_URL_${suffix}`;
}

/**
 * Resolve the outbound TrainingPeaks plan URL for a Premium rider, honouring
 * the per-slug override then the general fallback. Returns null when nothing
 * is configured — the caller must then show the "being built" state rather
 * than invent a URL.
 */
export function resolveTrainingPeaksPlanUrl(slug: string): string | null {
  const perSlug = process.env[planUrlEnvKey(slug)];
  if (perSlug && perSlug.trim().length > 0) return perSlug.trim();

  const general = process.env.METHOD_TRAININGPEAKS_PLAN_URL;
  if (general && general.trim().length > 0) return general.trim();

  return null;
}
