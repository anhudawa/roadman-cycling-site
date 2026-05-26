// ---------------------------------------------------------------------------
// Canonical-entity adapter for the extraction pipeline.
//
// Bridges the extractor to src/data/canonical-entities.ts (the site's single
// source of truth for how every expert/coach/scientist/pro is named). Used to
// (a) hand the model a controlled vocabulary + canonical name list, and
// (b) reconcile extracted speakers and topic tags back to canonical slugs.
//
// Resolved at runtime via the repo's `@/*` tsconfig path (tsx), the same way
// scripts/ import from src/. No network, no DB — safe in offline dry-runs.
// ---------------------------------------------------------------------------

import {
  CANONICAL_ENTITIES,
  findEntityByVariation,
  type CanonicalEntity,
} from "@/data/canonical-entities";

export type { CanonicalEntity };

/** kebab-case slug, diacritics stripped. Mirrors the site's slug style. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Unique controlled subject vocabulary, aggregated from every entity's `topics`. */
export const TOPIC_VOCAB: string[] = Array.from(
  new Set(CANONICAL_ENTITIES.flatMap((e) => e.topics))
).sort((a, b) => a.localeCompare(b));

/** Canonical display names, for the model's speaker-attribution guidance. */
export const CANONICAL_NAMES: string[] = Array.from(
  new Set(CANONICAL_ENTITIES.map((e) => e.canonicalName))
).sort((a, b) => a.localeCompare(b));

export interface ResolvedSpeaker {
  /** Canonical-entity slug when the raw name reconciles, else undefined. */
  entitySlug?: string;
  /** Canonical display name when reconciled, else the raw input unchanged. */
  canonicalName: string;
}

/**
 * Reconcile a raw speaker/mention string to a canonical entity. Matches exact
 * surface forms and the surname-only variations curated in the registry
 * (e.g. "Seiler" -> Professor Stephen Seiler).
 */
export function resolveSpeaker(raw: string | null | undefined): ResolvedSpeaker {
  const value = (raw ?? "").trim();
  if (!value) return { canonicalName: "" };
  const entity = findEntityByVariation(value);
  if (entity) {
    return { entitySlug: entity.slug, canonicalName: entity.canonicalName };
  }
  return { canonicalName: value };
}

/** The canonical entity behind a raw mention, or undefined. */
export function resolveEntity(raw: string): CanonicalEntity | undefined {
  return findEntityByVariation(raw.trim());
}

export interface EntityScanHit {
  entity: CanonicalEntity;
  /** Number of surface-form occurrences found in the transcript. */
  count: number;
}

// Precompiled per-entity matcher: any of the entity's variations as a
// word-bounded, case-insensitive alternation. Built once at module load.
const ENTITY_MATCHERS: Array<{ entity: CanonicalEntity; re: RegExp }> =
  CANONICAL_ENTITIES.map((entity) => {
    const forms = Array.from(new Set([entity.canonicalName, ...entity.variations]))
      // Longest-first so "Stephen Seiler" wins before "Seiler" when counting.
      .sort((a, b) => b.length - a.length)
      .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`\\b(?:${forms.join("|")})\\b`, "gi");
    return { entity, re };
  });

/**
 * Deterministic backstop for entity tagging: scan the transcript for any
 * canonical surface form. Complements the model's topic tags so a mention it
 * misses still maps to the right entity. Returns hits keyed by entity slug.
 */
export function scanTranscriptForEntities(
  transcript: string
): Map<string, EntityScanHit> {
  const hits = new Map<string, EntityScanHit>();
  if (!transcript) return hits;
  for (const { entity, re } of ENTITY_MATCHERS) {
    const matches = transcript.match(re);
    if (matches && matches.length > 0) {
      hits.set(entity.slug, { entity, count: matches.length });
    }
  }
  return hits;
}
