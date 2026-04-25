/**
 * Retrieval fan-out for Ask Roadman.
 *
 * Runs episode, methodology, and content-chunk searches in parallel, merges
 * the results, dedupes by (sourceType, sourceId), sorts by relevance score
 * desc, and caps the final set (default 10). Safe to call from the orchestrator
 * hot path $€” a single search failure (e.g. methodology offline) won't take
 * down the others because we use `Promise.allSettled`.
 */

import { searchEpisodes } from "@/lib/mcp/services/episodes";
import { searchMethodology } from "@/lib/mcp/services/methodology";
import { searchContentChunks } from "./content-chunks";
import type { Intent, RetrievalResult, RetrievedChunk } from "../types";

const EPISODE_LIMIT = 6;
const METHODOLOGY_LIMIT = 4;
const CONTENT_LIMIT = 4;

// intents that shouldn't retrieve at all
const NON_RETRIEVING: Intent[] = ["off_topic", "safety_medical", "safety_injury", "safety_weight"];

export interface RetrieveInput {
  query: string;
  intent: Intent;
  limit?: number;
}

type EpisodeResult = Awaited<ReturnType<typeof searchEpisodes>>[number];
type MethodologyResult = Awaited<ReturnType<typeof searchMethodology>>[number];

function episodeToChunk(r: EpisodeResult): RetrievedChunk {
  return {
    sourceType: "episode",
    sourceId: String(r.episode_id),
    title: r.title,
    url: r.url ?? undefined,
    excerpt: r.excerpt,
    score: r.relevance_score,
  };
}

function methodologyToChunk(r: MethodologyResult): RetrievedChunk {
  const meth = r as MethodologyResult & {
    id: number;
    principle: string;
    explanation: string;
    relevance_score: number | string;
  };
  return {
    sourceType: "methodology",
    sourceId: String(meth.id),
    title: meth.principle,
    url: undefined,
    excerpt: meth.explanation,
    score: Number(meth.relevance_score),
  };
}

export async function retrieve(input: RetrieveInput): Promise<RetrievalResult> {
  if (NON_RETRIEVING.includes(input.intent)) {
    return { chunks: [], totalCandidates: 0 };
  }

  const cap = input.limit ?? 10;

  const [epRes, methRes, contentRes] = await Promise.allSettled([
    searchEpisodes(input.query, EPISODE_LIMIT),
    searchMethodology(input.query),
    searchContentChunks(input.query, CONTENT_LIMIT),
  ]);

  const eps: RetrievedChunk[] = epRes.status === "fulfilled"
    ? epRes.value.map(episodeToChunk)
    : [];
  const methRaw: MethodologyResult[] = methRes.status === "fulfilled"
    ? (methRes.value as MethodologyResult[]).slice(0, METHODOLOGY_LIMIT)
    : [];
  const meths: RetrievedChunk[] = methRaw.map(methodologyToChunk);
  const content: RetrievedChunk[] = contentRes.status === "fulfilled" ? contentRes.value : [];

  const totalCandidates = eps.length + meths.length + content.length;

  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];
  for (const c of [...eps, ...meths, ...content]) {
    const key = `${c.sourceType}:${c.sourceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(c);
  }

  merged.sort((a, b) => b.score - a.score);

  return {
    chunks: merged.slice(0, cap),
    totalCandidates,
  };
}
