import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllTopics } from "@/lib/topics";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { getAllGuests } from "@/lib/guests";
import { getAllTools } from "@/lib/tools-registry";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";

interface SearchHit {
  id: string;
  type: "article" | "episode" | "topic" | "glossary" | "guest" | "tool";
  title: string;
  url: string;
  summary: string;
  primaryTopic: string;
  datePublished: string | null;
  lastReviewed: string | null;
  score: number;
}

const ALL_TYPES: SearchHit["type"][] = [
  "article",
  "episode",
  "topic",
  "glossary",
  "guest",
  "tool",
];

/** Tokenise a query: lowercase, split on whitespace and `+`, drop falsy. */
function tokenise(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s+]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Score a haystack against query tokens. Title matches weighted ~3x,
 * keyword/topic matches ~2x, body matches 1x. Substring match — fast,
 * deterministic, no external dependency.
 */
function scoreHit(
  tokens: string[],
  parts: { title: string; keywords: string[]; body: string },
): number {
  let score = 0;
  const title = parts.title.toLowerCase();
  const keywords = parts.keywords.map((k) => k.toLowerCase());
  const body = parts.body.toLowerCase();

  for (const t of tokens) {
    if (title.includes(t)) score += 3;
    if (keywords.some((k) => k.includes(t))) score += 2;
    if (body.includes(t)) score += 1;
  }
  return score;
}

/**
 * GET /api/v1/search?q=ftp+plateau&limit=20&type=article
 *
 * Public read-only full-text search across articles, episodes,
 * topics, glossary terms, podcast guests, and free tools. Results
 * sorted by relevance score.
 *
 * Query params:
 *   - q (required): query string
 *   - limit (optional, default 20, max 100)
 *   - type (optional): comma-separated list to scope the search
 *     to specific content types
 *     ("article" | "episode" | "topic" | "glossary" | "guest" | "tool")
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const rawLimit = parseInt(url.searchParams.get("limit") || "20", 10);
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 20, 1), 100);
  const typeFilter = (url.searchParams.get("type") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!q) {
    return NextResponse.json(
      {
        query: "",
        count: 0,
        results: [],
        error: "Missing required query parameter: q",
      },
      { status: 400 },
    );
  }

  const tokens = tokenise(q);
  if (tokens.length === 0) {
    return NextResponse.json(
      { query: q, count: 0, results: [] },
      { headers: FEED_CACHE_HEADERS },
    );
  }

  const includes = (type: SearchHit["type"]) =>
    typeFilter.length === 0 || typeFilter.includes(type);

  const hits: SearchHit[] = [];

  if (includes("article")) {
    for (const post of getAllPosts()) {
      const score = scoreHit(tokens, {
        title: post.title,
        keywords: post.keywords ?? [],
        body: `${post.seoDescription} ${post.excerpt} ${post.answerCapsule ?? ""}`,
      });
      if (score > 0) {
        hits.push({
          id: post.slug,
          type: "article",
          title: post.title,
          url: feedUrl(`/blog/${post.slug}`),
          summary: summarise(post.answerCapsule || post.seoDescription || post.excerpt),
          primaryTopic: post.pillar,
          datePublished: post.publishDate,
          lastReviewed: post.lastReviewed ?? post.updatedDate ?? null,
          score,
        });
      }
    }
  }

  if (includes("episode")) {
    for (const ep of getAllEpisodes()) {
      const score = scoreHit(tokens, {
        title: ep.title,
        keywords: [...(ep.keywords ?? []), ...(ep.topicTags ?? []), ep.guest ?? ""],
        body: `${ep.seoDescription} ${ep.description} ${ep.answerCapsule ?? ""}`,
      });
      if (score > 0) {
        hits.push({
          id: ep.slug,
          type: "episode",
          title: ep.title,
          url: feedUrl(`/podcast/${ep.slug}`),
          summary: summarise(ep.answerCapsule || ep.seoDescription || ep.description),
          primaryTopic: ep.pillar,
          datePublished: ep.publishDate,
          lastReviewed: null,
          score,
        });
      }
    }
  }

  if (includes("topic")) {
    for (const t of getAllTopics()) {
      const score = scoreHit(tokens, {
        title: t.title,
        keywords: t.keywords ?? [],
        body: `${t.headline} ${t.description}`,
      });
      if (score > 0) {
        hits.push({
          id: t.slug,
          type: "topic",
          title: t.title,
          url: feedUrl(`/topics/${t.slug}`),
          summary: summarise(t.description),
          primaryTopic: t.pillar,
          datePublished: null,
          lastReviewed: null,
          score,
        });
      }
    }
  }

  if (includes("glossary")) {
    for (const term of GLOSSARY_TERMS) {
      const score = scoreHit(tokens, {
        title: term.term,
        keywords: term.relatedTerms ?? [],
        body: `${term.definition} ${term.extendedDefinition}`,
      });
      if (score > 0) {
        hits.push({
          id: term.slug,
          type: "glossary",
          title: term.term,
          url: feedUrl(`/glossary/${term.slug}`),
          summary: summarise(term.definition),
          primaryTopic: term.pillar,
          datePublished: null,
          lastReviewed: null,
          score,
        });
      }
    }
  }

  if (includes("guest")) {
    for (const guest of getAllGuests()) {
      const score = scoreHit(tokens, {
        title: guest.name,
        keywords: [...guest.pillars, ...guest.tags],
        body: `${guest.credential ?? ""} ${guest.episodes.map((e) => e.title).join(" ")}`,
      });
      if (score > 0) {
        hits.push({
          id: guest.slug,
          type: "guest",
          title: guest.name,
          url: feedUrl(`/guests/${guest.slug}`),
          summary: summarise(
            guest.credential
              ? `${guest.name} — ${guest.credential}. Featured on ${guest.episodeCount} Roadman Cycling Podcast episode${guest.episodeCount === 1 ? "" : "s"}.`
              : `${guest.name} — featured on ${guest.episodeCount} Roadman Cycling Podcast episodes.`,
          ),
          primaryTopic: guest.pillars[0] ?? "community",
          datePublished: guest.firstAppearance,
          lastReviewed: guest.latestAppearance,
          score,
        });
      }
    }
  }

  if (includes("tool")) {
    for (const tool of getAllTools()) {
      const score = scoreHit(tokens, {
        title: tool.title,
        keywords: tool.inputs ?? [],
        body: tool.description,
      });
      if (score > 0) {
        hits.push({
          id: tool.slug,
          type: "tool",
          title: tool.title,
          url: feedUrl(`/tools/${tool.slug}`),
          summary: summarise(tool.description),
          primaryTopic: tool.pillar,
          datePublished: null,
          lastReviewed: null,
          score,
        });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const results = hits.slice(0, limit);

  return NextResponse.json(
    {
      query: q,
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      count: results.length,
      totalMatches: hits.length,
      indexedTypes: ALL_TYPES,
      results,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
