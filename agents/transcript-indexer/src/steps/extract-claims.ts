// ---------------------------------------------------------------------------
// Claim / quote / topic-tag extraction.
//
// Takes one episode transcript, calls the (provider-agnostic) LLM client, then
// validates and reconciles the result: speakers and entity tags are mapped to
// canonical slugs from src/data/canonical-entities.ts, quote word counts are
// computed, and a deterministic transcript scan backstops the model's entity
// tagging. Pure transformation — no DB, no filesystem — so it is trivially
// testable and safe under dry-run.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { loadPrompt, parseJsonResponse } from "../lib/anthropic.js";
import type { LLMClient } from "../lib/llm.js";
import {
  CANONICAL_NAMES,
  TOPIC_VOCAB,
  resolveEntity,
  resolveSpeaker,
  scanTranscriptForEntities,
  slugify,
} from "../lib/canonical.js";

// --- Public result types -----------------------------------------------------

export type EvidenceLevel =
  | "study"
  | "expert"
  | "practice"
  | "anecdote"
  | "opinion";

export interface ExtractedClaim {
  claim: string;
  /** 0–1 confidence the statement is accurately captured / asserted. */
  confidence: number;
  evidence: EvidenceLevel;
  claimType: string | null;
  /** Canonical name when the speaker reconciles, else the raw label, else null. */
  speaker: string | null;
  speakerEntitySlug: string | null;
  supportingQuote: string | null;
  /** Transcript time reference (e.g. "12:34") when present, else null. Never fabricated. */
  timestamp: string | null;
  /** Canonical subject/entity slugs. */
  topicTags: string[];
}

export interface ExtractedQuote {
  quote: string;
  speaker: string;
  speakerCredential: string | null;
  speakerEntitySlug: string | null;
  wordCount: number;
  context: string | null;
  /** Transcript time reference (e.g. "12:34") when present, else null. Never fabricated. */
  timestamp: string | null;
  topicTags: string[];
}

export interface ExtractedTopicTag {
  /** Display label — canonical name for entities, the subject for topics. */
  tag: string;
  /** Kebab slug; equals entitySlug when kind === "entity". */
  slug: string;
  kind: "topic" | "entity";
  entitySlug: string | null;
  relevance: number;
}

export interface ExtractionInput {
  slug: string;
  title: string;
  guest?: string | null;
  publishDate?: string;
  pillar?: string;
  transcript: string;
}

export interface EpisodeExtraction {
  slug: string;
  title: string;
  model: string;
  extractedAt: string;
  claims: ExtractedClaim[];
  quotes: ExtractedQuote[];
  topicTags: ExtractedTopicTag[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    runtimeMs: number;
  };
}

export interface ExtractOptions {
  promptsDir: string;
  /** Max transcript words sent to the model. Default 18000. */
  maxTranscriptWords?: number;
  maxTokens?: number;
}

// --- LLM output schema (lenient — the model is the untrusted boundary) --------

const EVIDENCE_LEVELS: EvidenceLevel[] = [
  "study",
  "expert",
  "practice",
  "anecdote",
  "opinion",
];

const rawClaim = z.object({
  claim: z.string(),
  confidence: z.number().optional(),
  evidence: z.string().optional(),
  claimType: z.string().nullish(),
  speaker: z.string().nullish(),
  supportingQuote: z.string().nullish(),
  timestamp: z.string().nullish(),
  topicTags: z.array(z.string()).optional(),
});

const rawQuote = z.object({
  quote: z.string(),
  speaker: z.string().nullish(),
  speakerCredential: z.string().nullish(),
  context: z.string().nullish(),
  timestamp: z.string().nullish(),
  topicTags: z.array(z.string()).optional(),
});

const rawTag = z.object({
  tag: z.string(),
  kind: z.string().optional(),
  relevance: z.number().optional(),
});

const rawExtraction = z.object({
  claims: z.array(rawClaim).optional(),
  quotes: z.array(rawQuote).optional(),
  topicTags: z.array(rawTag).optional(),
});

// --- Helpers -----------------------------------------------------------------

function clamp01(n: number | undefined, fallback: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Normalise an arbitrary tag string to a canonical slug (entity slug or subject slug). */
function tagToSlug(raw: string): string {
  const entity = resolveEntity(raw);
  return entity ? entity.slug : slugify(raw);
}

function normaliseTagList(tags: string[] | undefined): string[] {
  if (!tags) return [];
  const out = new Set<string>();
  for (const t of tags) {
    const slug = tagToSlug(t);
    if (slug) out.add(slug);
  }
  return Array.from(out);
}

/**
 * Pull the JSON object out of a model response even if it wrapped the JSON in
 * prose. Falls back to a brace-slice before giving up.
 */
function extractJsonObject(text: string): unknown {
  try {
    return parseJsonResponse<unknown>(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last > first) {
      return JSON.parse(text.slice(first, last + 1));
    }
    throw new Error("LLM response did not contain parseable JSON");
  }
}

function buildUserMessage(input: ExtractionInput, maxWords: number): string {
  const words = input.transcript.split(/\s+/);
  const transcript =
    words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + " …[transcript truncated]"
      : input.transcript;

  return [
    `## Episode`,
    `Title: ${input.title}`,
    input.guest ? `Guest: ${input.guest}` : `Guest: (none / solo or panel)`,
    input.publishDate ? `Published: ${input.publishDate}` : "",
    input.pillar ? `Pillar: ${input.pillar}` : "",
    ``,
    `## Controlled subject vocabulary (prefer these for topic tags)`,
    TOPIC_VOCAB.join(", "),
    ``,
    `## Canonical names (prefer these spellings for people)`,
    CANONICAL_NAMES.join(", "),
    ``,
    `## Transcript`,
    transcript,
  ]
    .filter(Boolean)
    .join("\n");
}

// --- Main --------------------------------------------------------------------

export async function extractFromEpisode(
  input: ExtractionInput,
  llm: LLMClient,
  opts: ExtractOptions
): Promise<EpisodeExtraction> {
  const system = loadPrompt(opts.promptsDir, "extract-claims.md");
  const user = buildUserMessage(input, opts.maxTranscriptWords ?? 18000);

  const result = await llm.complete({
    system,
    user,
    maxTokens: opts.maxTokens ?? 8000,
  });

  const parsedJson = extractJsonObject(result.text);
  const parsed = rawExtraction.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(
      `Extraction JSON failed validation: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`
    );
  }
  const data = parsed.data;

  // Claims ---------------------------------------------------------------------
  const claims: ExtractedClaim[] = (data.claims ?? [])
    .filter((c) => c.claim && c.claim.trim().length > 0)
    .map((c) => {
      const speaker = resolveSpeaker(c.speaker);
      const evidence = (
        c.evidence && EVIDENCE_LEVELS.includes(c.evidence as EvidenceLevel)
          ? c.evidence
          : "opinion"
      ) as EvidenceLevel;
      return {
        claim: c.claim.trim(),
        confidence: clamp01(c.confidence, 0.5),
        evidence,
        claimType: c.claimType?.trim() || null,
        speaker: speaker.canonicalName || null,
        speakerEntitySlug: speaker.entitySlug ?? null,
        supportingQuote: c.supportingQuote?.trim() || null,
        timestamp: c.timestamp?.trim() || null,
        topicTags: normaliseTagList(c.topicTags),
      };
    });

  // Quotes (require an attributable speaker) -----------------------------------
  const quotes: ExtractedQuote[] = (data.quotes ?? [])
    .filter((q) => q.quote && q.quote.trim().length > 0)
    .filter((q) => q.speaker && q.speaker.trim().length > 0)
    .map((q) => {
      const speaker = resolveSpeaker(q.speaker);
      const entity = q.speaker ? resolveEntity(q.speaker) : undefined;
      const quote = q.quote.trim();
      return {
        quote,
        speaker: speaker.canonicalName,
        speakerCredential: q.speakerCredential?.trim() || entity?.title || null,
        speakerEntitySlug: speaker.entitySlug ?? null,
        wordCount: wordCount(quote),
        context: q.context?.trim() || null,
        timestamp: q.timestamp?.trim() || null,
        topicTags: normaliseTagList(q.topicTags),
      };
    });

  // Topic tags: model tags + deterministic transcript-entity scan -------------
  const tagsBySlug = new Map<string, ExtractedTopicTag>();

  for (const t of data.topicTags ?? []) {
    if (!t.tag || !t.tag.trim()) continue;
    const entity = resolveEntity(t.tag);
    const relevance = clamp01(t.relevance, 0.5);
    if (entity) {
      mergeTag(tagsBySlug, {
        tag: entity.canonicalName,
        slug: entity.slug,
        kind: "entity",
        entitySlug: entity.slug,
        relevance,
      });
    } else {
      // Didn't reconcile to a canonical entity — record it as a subject.
      // Invariant: kind 'entity' always carries an entitySlug, so an
      // unresolved tag (even one the model labelled 'entity') is a 'topic'.
      const slug = slugify(t.tag);
      if (!slug) continue;
      mergeTag(tagsBySlug, {
        tag: t.tag.trim(),
        slug,
        kind: "topic",
        entitySlug: null,
        relevance,
      });
    }
  }

  for (const { entity, count } of scanTranscriptForEntities(input.transcript).values()) {
    mergeTag(tagsBySlug, {
      tag: entity.canonicalName,
      slug: entity.slug,
      kind: "entity",
      entitySlug: entity.slug,
      relevance: clamp01(0.4 + count * 0.1, 0.4),
    });
  }

  const topicTags = Array.from(tagsBySlug.values()).sort(
    (a, b) => b.relevance - a.relevance
  );

  return {
    slug: input.slug,
    title: input.title,
    model: result.model,
    extractedAt: new Date().toISOString(),
    claims,
    quotes,
    topicTags,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
      runtimeMs: result.runtimeMs,
    },
  };
}

/** Insert a tag, keeping the higher relevance and the stronger (entity) kind on collision. */
function mergeTag(
  map: Map<string, ExtractedTopicTag>,
  tag: ExtractedTopicTag
): void {
  const existing = map.get(tag.slug);
  if (!existing) {
    map.set(tag.slug, tag);
    return;
  }
  existing.relevance = Math.max(existing.relevance, tag.relevance);
  if (tag.kind === "entity") {
    existing.kind = "entity";
    existing.entitySlug = tag.entitySlug;
    existing.tag = tag.tag;
  }
}
