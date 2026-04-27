import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAllEpisodes, getEpisodeBySlug } from "@/lib/podcast";
import { getTopicBySlug } from "@/lib/topics";
import { getGuestBySlug } from "@/lib/guests";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";

type FetchType = "article" | "episode" | "topic" | "glossary" | "guest";

const TYPE_ORDER: FetchType[] = ["article", "episode", "topic", "glossary", "guest"];

function fetchArticle(id: string) {
  const post = getPostBySlug(id);
  if (!post) return null;

  const relatedEpisodeSlugs = post.relatedEpisodes ?? [];
  const allEpisodes = getAllEpisodes();
  const relatedEpisodes = relatedEpisodeSlugs
    .map((slug) => allEpisodes.find((e) => e.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => ({
      id: e.slug,
      title: e.title,
      url: feedUrl(`/podcast/${e.slug}`),
      datePublished: e.publishDate,
    }));

  return {
    id: post.slug,
    type: "article" as const,
    title: post.title,
    url: feedUrl(`/blog/${post.slug}`),
    summary: summarise(post.answerCapsule || post.seoDescription || post.excerpt),
    body: post.content,
    bodyFormat: "markdown" as const,
    author: post.author,
    datePublished: post.publishDate,
    dateModified: post.updatedDate || post.publishDate,
    reviewedBy: post.reviewedBy ?? null,
    lastReviewed: post.lastReviewed ?? null,
    primaryTopic: post.pillar,
    keywords: post.keywords ?? [],
    citations:
      post.experts?.map((e) => ({
        name: e.name,
        role: e.role ?? null,
        url: e.href ?? null,
      })) ?? [],
    relatedPages: {
      articles: [],
      episodes: relatedEpisodes,
      topics: [],
    },
    faq: post.faq ?? [],
    schemaEntities: {
      articleType: "BlogPosting",
      author: post.author,
      headline: post.title,
      datePublished: post.publishDate,
      dateModified: post.updatedDate || post.publishDate,
      keywords: post.keywords ?? [],
    },
  };
}

function fetchEpisode(id: string) {
  const ep = getEpisodeBySlug(id);
  if (!ep) return null;

  const relatedPostSlugs = ep.relatedPosts ?? [];
  const allPosts = getAllPosts();
  const relatedArticles = relatedPostSlugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      id: p.slug,
      title: p.title,
      url: feedUrl(`/blog/${p.slug}`),
      datePublished: p.publishDate,
    }));

  return {
    id: ep.slug,
    type: "episode" as const,
    title: ep.title,
    url: feedUrl(`/podcast/${ep.slug}`),
    summary: summarise(ep.answerCapsule || ep.seoDescription || ep.description),
    body: ep.content,
    bodyFormat: "markdown" as const,
    transcript: ep.transcript ?? null,
    author: ep.guest || "Anthony Walsh",
    authorCredential: ep.guestCredential ?? null,
    datePublished: ep.publishDate,
    dateModified: ep.publishDate,
    reviewedBy: null,
    lastReviewed: null,
    primaryTopic: ep.pillar,
    keywords: [...(ep.keywords ?? []), ...(ep.topicTags ?? [])],
    citations: ep.guest
      ? [{ name: ep.guest, role: ep.guestCredential ?? null, url: null }]
      : [],
    keyQuotes: ep.keyQuotes ?? [],
    relatedPages: {
      articles: relatedArticles,
      episodes: [],
      topics: [],
    },
    faq: ep.faq ?? [],
    schemaEntities: {
      articleType: "PodcastEpisode",
      episodeNumber: ep.episodeNumber,
      duration: ep.duration,
      guest: ep.guest ?? null,
      keywords: ep.keywords ?? [],
    },
  };
}

function fetchTopic(id: string) {
  const t = getTopicBySlug(id);
  if (!t) return null;

  return {
    id: t.slug,
    type: "topic" as const,
    title: t.title,
    url: feedUrl(`/topics/${t.slug}`),
    summary: summarise(t.description),
    body: t.pillarContent ?? null,
    bodyFormat: "markdown" as const,
    author: "Anthony Walsh",
    datePublished: null,
    dateModified: null,
    reviewedBy: null,
    lastReviewed: null,
    primaryTopic: t.pillar,
    keywords: t.keywords ?? [],
    citations: [],
    relatedPages: {
      articles: t.posts.map((p) => ({
        id: p.slug,
        title: p.title,
        url: feedUrl(`/blog/${p.slug}`),
        datePublished: p.publishDate,
      })),
      episodes: t.episodes.map((e) => ({
        id: e.slug,
        title: e.title,
        url: feedUrl(`/podcast/${e.slug}`),
        datePublished: e.publishDate,
      })),
      topics: (t.relatedTopics ?? []).map((slug) => ({
        id: slug,
        title: slug,
        url: feedUrl(`/topics/${slug}`),
        datePublished: null,
      })),
      tools: t.tools.map((tool) => ({
        id: tool.slug,
        title: tool.title,
        url: feedUrl(tool.href),
      })),
    },
    faq: [],
    schemaEntities: {
      articleType: "CollectionPage",
      headline: t.title,
      keywords: t.keywords ?? [],
    },
  };
}

function fetchGlossary(id: string) {
  const term = GLOSSARY_TERMS.find((g) => g.slug === id);
  if (!term) return null;

  return {
    id: term.slug,
    type: "glossary" as const,
    title: term.term,
    url: feedUrl(`/glossary/${term.slug}`),
    summary: summarise(term.definition),
    body: term.extendedDefinition,
    bodyFormat: "markdown" as const,
    author: "Anthony Walsh",
    datePublished: null,
    dateModified: null,
    reviewedBy: null,
    lastReviewed: null,
    primaryTopic: term.pillar,
    keywords: term.relatedTerms ?? [],
    citations: [],
    relatedPages: {
      articles: term.relatedArticle
        ? [{ id: term.relatedArticle, title: term.term, url: feedUrl(term.relatedArticle), datePublished: null }]
        : [],
      episodes: [],
      topics: term.relatedTopicHub
        ? [{ id: term.relatedTopicHub, title: term.term, url: feedUrl(term.relatedTopicHub), datePublished: null }]
        : [],
      tools: term.relatedTool
        ? [{ id: term.relatedTool, title: term.term, url: feedUrl(term.relatedTool) }]
        : [],
    },
    faq: [],
    schemaEntities: {
      articleType: "DefinedTerm",
      headline: term.term,
    },
  };
}

function fetchGuest(id: string) {
  const guest = getGuestBySlug(id);
  if (!guest) return null;

  return {
    id: guest.slug,
    type: "guest" as const,
    title: guest.name,
    url: feedUrl(`/guests/${guest.slug}`),
    summary: summarise(
      guest.credential
        ? `${guest.name} — ${guest.credential}. Featured on ${guest.episodeCount} Roadman Cycling Podcast episode${guest.episodeCount === 1 ? "" : "s"}.`
        : `${guest.name} — featured on ${guest.episodeCount} Roadman Cycling Podcast episodes.`,
    ),
    body: null,
    bodyFormat: "markdown" as const,
    author: guest.name,
    authorCredential: guest.credential ?? null,
    datePublished: guest.firstAppearance,
    dateModified: guest.latestAppearance,
    reviewedBy: null,
    lastReviewed: null,
    primaryTopic: guest.pillars[0] ?? null,
    keywords: [...guest.pillars, ...guest.tags],
    citations: [],
    relatedPages: {
      articles: [],
      episodes: guest.episodes.map((e) => ({
        id: e.slug,
        title: e.title,
        url: feedUrl(`/podcast/${e.slug}`),
        datePublished: e.publishDate,
      })),
      topics: [],
    },
    faq: [],
    schemaEntities: {
      articleType: "Person",
      name: guest.name,
      jobTitle: guest.credential ?? null,
    },
  };
}

const FETCHERS: Record<FetchType, (id: string) => unknown> = {
  article: fetchArticle,
  episode: fetchEpisode,
  topic: fetchTopic,
  glossary: fetchGlossary,
  guest: fetchGuest,
};

/**
 * GET /api/v1/fetch?id=why-your-ftp-is-not-improving&type=article
 *
 * Returns the full detail for a single piece of content. Body is
 * delivered as raw markdown for AI agents to parse without scraping.
 *
 * Query params:
 *   - id (required): slug of the content
 *   - type (optional): "article" | "episode" | "topic" | "glossary" | "guest"
 *     If omitted, all types are searched in priority order and the
 *     first match returned.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const type = url.searchParams.get("type")?.trim().toLowerCase() as FetchType | null;

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 },
    );
  }

  if (type) {
    if (!TYPE_ORDER.includes(type)) {
      return NextResponse.json(
        {
          error: `Invalid type. Must be one of: ${TYPE_ORDER.join(", ")}`,
        },
        { status: 400 },
      );
    }
    const result = FETCHERS[type](id);
    if (!result) {
      return NextResponse.json(
        { error: `No ${type} found with id "${id}"` },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { generatedAt: new Date().toISOString(), baseUrl: FEED_BASE_URL, item: result },
      { headers: FEED_CACHE_HEADERS },
    );
  }

  for (const t of TYPE_ORDER) {
    const result = FETCHERS[t](id);
    if (result) {
      return NextResponse.json(
        { generatedAt: new Date().toISOString(), baseUrl: FEED_BASE_URL, item: result },
        { headers: FEED_CACHE_HEADERS },
      );
    }
  }

  return NextResponse.json(
    { error: `No content found with id "${id}". Try specifying ?type=article|episode|topic|glossary|guest` },
    { status: 404 },
  );
}
