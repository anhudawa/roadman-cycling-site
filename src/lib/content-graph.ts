/**
 * src/lib/content-graph.ts
 *
 * Unified content graph $— the single query layer for all content
 * relationships. Any template can ask "what's related to X?" and
 * get articles, episodes, tools, guests, comparisons, glossary
 * terms, and commercial pages back.
 *
 * Blueprint technical item 7: "Model at minimum: Topic, Article,
 * Episode, Person, Tool, Event, Offer, Study."
 */

import { getAllPosts, getPostBySlug, type BlogPostMeta } from "./blog";
import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { getAllGuests, type GuestProfile } from "./guests";
import { getAllTopics, getTopicBySlug, type TopicHub } from "./topics";
import { EVENTS, type TrainingEvent } from "./training-plans";
import { GLOSSARY_TERMS, type GlossaryTerm } from "./glossary";
import { COMPARISONS, type ComparisonPage } from "./comparisons";
import { BEST_FOR_PAGES, type BestForPage } from "./best-for";
import { PROBLEM_PAGES, type ProblemPage } from "./problems";

export interface ContentGraphQuery {
  topicSlug?: string;
  pillar?: string;
  limit?: number;
}

export interface ContentGraphResult {
  topic: TopicHub | null;
  articles: BlogPostMeta[];
  episodes: EpisodeMeta[];
  tools: { slug: string; title: string; href: string }[];
  guests: GuestProfile[];
  comparisons: ComparisonPage[];
  glossaryTerms: GlossaryTerm[];
  bestForPages: BestForPage[];
  problemPages: ProblemPage[];
  events: TrainingEvent[];
  commercialPath: string;
}

export function queryContentGraph(query: ContentGraphQuery): ContentGraphResult {
  const limit = query.limit || 10;

  const topic = query.topicSlug ? getTopicBySlug(query.topicSlug) : null;
  const pillar = query.pillar || topic?.pillar;

  // Articles $— from topic or by pillar
  let articles: BlogPostMeta[] = [];
  if (topic) {
    articles = topic.posts.slice(0, limit);
  } else if (pillar) {
    articles = getAllPosts()
      .filter((p) => p.pillar === pillar)
      .slice(0, limit);
  }

  // Episodes $— from topic or by pillar
  let episodes: EpisodeMeta[] = [];
  if (topic) {
    episodes = topic.episodes.slice(0, limit);
  } else if (pillar) {
    episodes = getAllEpisodes()
      .filter((e) => e.pillar === pillar)
      .slice(0, limit);
  }

  // Tools
  const tools = topic?.tools || [];

  // Guests $— by pillar
  const guests = pillar
    ? getAllGuests()
        .filter((g) => g.pillars.includes(pillar as any))
        .slice(0, 5)
    : [];

  // Comparisons $— by pillar
  const comparisons = pillar
    ? COMPARISONS.filter((c) => c.pillar === pillar).slice(0, 5)
    : [];

  // Glossary $— by pillar
  const glossaryTerms = pillar
    ? GLOSSARY_TERMS.filter((t) => t.pillar === pillar).slice(0, 5)
    : [];

  // Best-for $— by pillar
  const bestForPages = pillar
    ? BEST_FOR_PAGES.filter((p) => p.pillar === pillar).slice(0, 3)
    : [];

  // Problem pages $— by pillar
  const problemPages = pillar
    ? PROBLEM_PAGES.filter((p) => p.pillar === pillar).slice(0, 3)
    : [];

  // Events $— all (event pages are cross-pillar)
  const events = EVENTS.slice(0, 6);

  // Commercial path
  const commercialPath = topic?.commercialPath || "/coaching";

  return {
    topic,
    articles,
    episodes,
    tools,
    guests,
    comparisons,
    glossaryTerms,
    bestForPages,
    problemPages,
    events,
    commercialPath,
  };
}

/**
 * Quick stats for the site $— used in llms.txt, start-here, etc.
 */
export function getSiteStats() {
  return {
    blogPosts: getAllPosts().length,
    episodes: getAllEpisodes().length,
    guests: getAllGuests().length,
    topics: getAllTopics().length,
    tools: 8,
    events: EVENTS.length,
    comparisons: COMPARISONS.length,
    glossaryTerms: GLOSSARY_TERMS.length,
    bestForPages: BEST_FOR_PAGES.length,
    problemPages: PROBLEM_PAGES.length,
  };
}
