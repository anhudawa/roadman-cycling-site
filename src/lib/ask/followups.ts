/**
 * Dynamic follow-up suggestions for Ask Roadman.
 *
 * After an answer, the UI shows a few contextual "you might also ask" prompts.
 * The strongest source is the hand-authored answer library: every answer page
 * carries a deep, brand-voiced FAQ and a set of related questions. When the
 * retrieval step surfaces a content_chunk (an /answers page), we mine its FAQ
 * and question-style related links for the next thing the rider is likely to
 * wonder. If retrieval was thin, we fall back to a small per-intent set so the
 * rider is never left without a next step.
 *
 * Pure and deterministic — no model call, no DB — so it's cheap on the hot path
 * and trivially testable.
 */

import { getAnswerBySlug } from "@/lib/answers";
import type { Intent, RetrievedChunk } from "./types";

const DEFAULT_LIMIT = 3;

/** On-brand fallbacks when retrieval didn't surface enough answer-page FAQs. */
const INTENT_FALLBACKS: Record<Intent, string[]> = {
  plateau: [
    "How do I know if I'm overtrained or just undertrained?",
    "How long should a deload week actually be?",
    "Is my easy riding too hard?",
  ],
  fuelling: [
    "How do I train my gut to handle more carbs per hour?",
    "What should I eat the night before a long ride?",
    "Am I underfuelling my hard sessions?",
  ],
  recovery_masters: [
    "What recovery actually matters most after 40?",
    "How much should I change my training as a masters rider?",
    "Is HRV worth tracking?",
  ],
  event_prep: [
    "How should I taper for a big event?",
    "How do I pace a long climb on the day?",
    "What's the ideal last week before a sportive?",
  ],
  coaching_decision: [
    "When is it worth getting a coach?",
    "What should a good training plan actually include?",
    "How do I structure my week on limited hours?",
  ],
  training_general: [
    "How much zone 2 should I really be doing?",
    "How do I raise my FTP from here?",
    "Should cyclists lift weights?",
  ],
  content_discovery: [
    "Which episodes cover zone 2 training?",
    "What does the podcast say about fuelling?",
    "How do the pros approach strength training?",
  ],
  safety_medical: [],
  safety_injury: [],
  safety_weight: [],
  off_topic: [],
  unknown: [
    "How much zone 2 should I really be doing?",
    "How many carbs per hour should I take on a long ride?",
    "Should cyclists lift weights?",
  ],
};

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(normalise(s).split(" ").filter((t) => t.length >= 3));
}

/** Jaccard overlap — used to drop a candidate that just restates the question. */
function tooSimilar(a: string, b: string): boolean {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  if (sa.size === 0 || sb.size === 0) return false;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter += 1;
  const union = sa.size + sb.size - inter;
  return inter / union >= 0.7;
}

export interface BuildFollowupsInput {
  query: string;
  intent: Intent;
  chunks: RetrievedChunk[];
  limit?: number;
}

/**
 * Returns up to `limit` follow-up questions, ordered by relevance (answer-page
 * FAQs first, then per-intent fallbacks), deduped and filtered so none simply
 * repeats the rider's question.
 */
export function buildFollowups(input: BuildFollowupsInput): string[] {
  const limit = input.limit ?? DEFAULT_LIMIT;
  if (limit <= 0) return [];

  // Mine FAQs + question-style related links from the matched answer pages.
  const fromAnswers: string[] = [];
  for (const chunk of input.chunks) {
    if (chunk.sourceType !== "content_chunk") continue;
    const page = getAnswerBySlug(chunk.sourceId);
    if (!page) continue;
    for (const f of page.faq) fromAnswers.push(f.question);
    for (const r of page.relatedTopics) {
      if (r.label.trim().endsWith("?")) fromAnswers.push(r.label);
    }
  }

  const candidates = [...fromAnswers, ...(INTENT_FALLBACKS[input.intent] ?? [])];

  const picked: string[] = [];
  const seen = new Set<string>();
  for (const raw of candidates) {
    const q = raw.trim();
    if (!q) continue;
    const key = normalise(q);
    if (seen.has(key)) continue;
    if (tooSimilar(q, input.query)) continue;
    if (picked.some((p) => tooSimilar(q, p))) continue;
    seen.add(key);
    picked.push(q);
    if (picked.length >= limit) break;
  }

  return picked;
}
