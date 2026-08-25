/**
 * Retrieval from the hand-authored answer library (src/lib/answers-data).
 *
 * There are ~260 citation-optimised answer pages (the 12 topic files plus the
 * base set), each with a direct answer, named-expert evidence, and a deep FAQ.
 * They power the public /answers/{slug} routes — and they're exactly the kind
 * of grounded, Roadman-voiced material the ask flow should retrieve alongside
 * the DB-backed episode and expert-quote sources.
 *
 * Unlike the episode/quote services, answer pages aren't in Postgres and have
 * no vector embeddings, so this is a lexical (token-overlap) ranker run fully
 * in-memory. It's deterministic, dependency-free, and fast enough for the
 * orchestrator hot path: the corpus is built once and cached at module scope.
 *
 * Scoring is normalised to roughly 0–1 so results interleave sensibly with the
 * cosine scores coming back from `searchEpisodes` / `searchExpertQuotes` in the
 * retrieval merge.
 */

import { getAllAnswers, ANSWER_CLUSTERS, type AnswerPage } from "@/lib/answers";
import type { RetrievedChunk } from "../types";

/**
 * Field weights. The question and the extractable bits (direct answer, key
 * takeaways, FAQ questions) carry the most signal; supporting prose the least.
 * MAX_FIELD_WEIGHT drives score normalisation, so keep it in sync with the
 * highest weight below.
 */
const FIELD_WEIGHTS = {
  question: 5,
  directAnswer: 3,
  keyTakeaways: 3,
  faqQuestion: 3,
  cluster: 2,
  expertEvidence: 2,
  faqAnswer: 1,
  roadmanView: 1,
  relatedTopics: 1,
} as const;

const MAX_FIELD_WEIGHT = 5;

/** Below this normalised score a match is too weak to be worth surfacing. */
const MIN_SCORE = 0.06;

/** Cap content scores just under a perfect cosine so a flawless episode can still edge ahead. */
const SCORE_CAP = 0.98;

// Common English + question stopwords. Keep short tokens that matter in cycling
// (ftp, w/kg → "w"+"kg", vo2) out of this list by only filtering true noise.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for",
  "is", "are", "am", "be", "been", "being", "was", "were", "do", "does", "did",
  "i", "im", "ive", "me", "my", "you", "your", "we", "our", "it", "its", "this",
  "that", "these", "those", "what", "whats", "how", "why", "when", "where",
  "which", "who", "should", "would", "could", "can", "will", "shall", "may",
  "have", "has", "had", "get", "got", "with", "without", "about", "into", "from",
  "than", "then", "so", "as", "at", "by", "out", "up", "down", "not", "no",
  "much", "many", "more", "most", "some", "any", "really", "actually", "just",
  "like", "want", "need", "know", "there", "their", "they", "them", "also",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

interface IndexedAnswer {
  page: AnswerPage;
  /** token → best (highest) field weight that token appears under. */
  tokenWeights: Map<string, number>;
  /** Topic-defining tokens that prove the query belongs with this page. */
  anchorTokens: Set<string>;
  /** Lowercased question text, for the whole-phrase boost. */
  questionLower: string;
}

const CLUSTER_LABEL = new Map(ANSWER_CLUSTERS.map((c) => [c.id, c.label]));

function buildIndex(): IndexedAnswer[] {
  return getAllAnswers().map((page) => {
    const tokenWeights = new Map<string, number>();

    const add = (text: string, weight: number) => {
      for (const tok of tokenize(text)) {
        const prev = tokenWeights.get(tok);
        if (prev === undefined || weight > prev) tokenWeights.set(tok, weight);
      }
    };

    add(page.question, FIELD_WEIGHTS.question);
    add(page.directAnswer, FIELD_WEIGHTS.directAnswer);
    add(page.keyTakeaways.join(" "), FIELD_WEIGHTS.keyTakeaways);
    add(page.faq.map((f) => f.question).join(" "), FIELD_WEIGHTS.faqQuestion);
    add(
      `${page.cluster} ${CLUSTER_LABEL.get(page.cluster) ?? ""} ${page.pillar}`,
      FIELD_WEIGHTS.cluster,
    );
    add(
      page.expertEvidence
        .map((e) => `${e.name} ${e.credential ?? ""} ${e.insight}`)
        .join(" "),
      FIELD_WEIGHTS.expertEvidence,
    );
    add(page.faq.map((f) => f.answer).join(" "), FIELD_WEIGHTS.faqAnswer);
    add(page.roadmanView.join(" "), FIELD_WEIGHTS.roadmanView);
    add(page.relatedTopics.map((r) => r.label).join(" "), FIELD_WEIGHTS.relatedTopics);

    const anchorTokens = new Set(
      tokenize(
        [
          page.question,
          page.cluster,
          CLUSTER_LABEL.get(page.cluster) ?? "",
          page.pillar,
          page.relatedTopics.map((topic) => topic.label).join(" "),
        ].join(" "),
      ),
    );

    return {
      page,
      tokenWeights,
      anchorTokens,
      questionLower: page.question.toLowerCase(),
    };
  });
}

let INDEX: IndexedAnswer[] | null = null;
function getIndex(): IndexedAnswer[] {
  if (INDEX === null) INDEX = buildIndex();
  return INDEX;
}

function scoreAnswer(
  entry: IndexedAnswer,
  queryTokens: string[],
  normalisedQuery: string,
): number {
  let weightSum = 0;
  let matched = 0;
  for (const tok of queryTokens) {
    const w = entry.tokenWeights.get(tok);
    if (w !== undefined) {
      weightSum += w;
      matched += 1;
    }
  }
  // A single accidental word overlap is not enough evidence for a multi-term
  // query. Requiring both a minimum count and minimum coverage keeps ambiguous
  // words such as "stock" or "market" from pulling cycling pages into an
  // off-domain answer while preserving deliberate one-word searches like
  // "training" or "FTP".
  const minimumMatches =
    queryTokens.length === 1
      ? 1
      : Math.max(2, Math.ceil(queryTokens.length * 0.4));
  if (matched < minimumMatches) return 0;
  const anchorMatches = queryTokens.filter((token) =>
    entry.anchorTokens.has(token),
  ).length;
  const minimumAnchorMatches = queryTokens.length === 1 ? 1 : 2;
  if (anchorMatches < minimumAnchorMatches) return 0;

  // Normalise against the best case (every query token landing in the
  // question), then reward how much of the query was covered so a page that
  // matches 4/4 terms outranks one that matches 1/4 on a single heavy field.
  let score =
    (weightSum / (queryTokens.length * MAX_FIELD_WEIGHT)) *
    (0.5 + 0.5 * (matched / queryTokens.length));

  // Whole-phrase boost: the searcher's wording appears verbatim in the H1.
  if (normalisedQuery.length >= 6 && entry.questionLower.includes(normalisedQuery)) {
    score += 0.15;
  }

  return Math.min(SCORE_CAP, score);
}

function toChunk(entry: IndexedAnswer, score: number): RetrievedChunk {
  return {
    sourceType: "content_chunk",
    sourceId: entry.page.slug,
    title: entry.page.question,
    url: `/answers/${entry.page.slug}`,
    excerpt: entry.page.directAnswer,
    score,
  };
}

export async function searchContentChunks(
  query: string,
  limit = 4,
): Promise<RetrievedChunk[]> {
  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return [];
  const normalisedQuery = queryTokens.join(" ");

  const scored: Array<{ entry: IndexedAnswer; score: number }> = [];
  for (const entry of getIndex()) {
    const score = scoreAnswer(entry, queryTokens, normalisedQuery);
    if (score >= MIN_SCORE) scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ entry, score }) => toChunk(entry, score));
}

/** Test seam — drops the memoised corpus so a fresh index is built next call. */
export function __resetContentChunkIndex(): void {
  INDEX = null;
}
