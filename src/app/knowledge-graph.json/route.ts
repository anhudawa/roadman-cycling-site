import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests, slugifyGuestName } from "@/lib/guests";
import { getAllTopics, getAllTopicSlugs, getTopicsForPost } from "@/lib/topics";
import { getAllEntities } from "@/lib/entities";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { COMPARISONS } from "@/lib/comparisons";
import { PROBLEM_PAGES } from "@/lib/problems";
import { QUESTION_PAGES } from "@/lib/questions";
import { BEST_FOR_PAGES } from "@/lib/best-for";
import { EVENTS } from "@/lib/training-plans";
import { getAllTools } from "@/lib/tools-registry";
import {
  FEED_BASE_URL,
  FEED_CACHE_HEADERS,
  feedUrl,
  summarise,
} from "@/lib/feeds";

/**
 * GET /knowledge-graph.json
 *
 * A single-document, machine-readable graph of every first-class entity
 * on the site (people, topics, tools, episodes, articles, glossary
 * terms, training events, and the entity sub-types — comparisons,
 * problems, questions, best-for picks) plus the typed relationships
 * between them.
 *
 * Goes beyond the per-type feeds at /feeds/*.json by giving AI agents
 * one document where they can traverse "guest → episode → topic →
 * article → glossary term → tool" without re-stitching shape-mismatched
 * payloads.
 *
 * Node ids are namespaced (`type:slug` or `entity:subtype:slug`) so the
 * graph can be loaded into any property graph store without collisions.
 */

type NodeType =
  | "person"
  | "topic"
  | "tool"
  | "episode"
  | "article"
  | "term"
  | "event"
  | "entity";

interface GraphNode {
  id: string;
  type: NodeType;
  /** Sub-classification for `type: "entity"` nodes (comparison, problem,
   *  question, best-for). Unset on the eight first-class types. */
  subtype?: string;
  name: string;
  url: string | null;
  description?: string;
  /** Roadman content pillar — present where the source carries it. */
  pillar?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  /**
   * Verb describing the directed source→target link. Vocabulary:
   *   - guest_on / appears_in   (episode ↔ person)
   *   - authored_by             (article → person)
   *   - mentions_expert         (article → person)
   *   - about_topic             (article|episode → topic)
   *   - features_article        (topic → article)
   *   - features_episode        (topic → episode)
   *   - related_to              (any ↔ any, lateral)
   *   - uses_tool               (any → tool)
   *   - defined_in              (term → topic)
   *   - referenced_in           (term → article)
   *   - knows_about             (person → topic)
   *   - featured_in             (person → article)
   *   - recommends              (problem|best-for → any)
   *   - covered_by_article      (event → article)
   */
  relationship: string;
}

/** Pull a slug out of a path like "/blog/foo-bar". Returns null on miss. */
function pathSlug(path: string | null | undefined, prefix: string): string | null {
  if (!path) return null;
  const re = new RegExp(`^${prefix}/([a-z0-9-]+)/?`);
  const m = path.match(re);
  return m ? m[1] : null;
}

/** Map an internal href to its node id. Drives the recommends/related
 *  edges emitted by problems, questions, best-for picks, etc. */
function nodeIdFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const blog = pathSlug(path, "/blog");
  if (blog) return `article:${blog}`;
  const podcast = pathSlug(path, "/podcast");
  if (podcast) return `episode:${podcast}`;
  const topic = pathSlug(path, "/topics");
  if (topic) return `topic:${topic}`;
  const tool = pathSlug(path, "/tools");
  if (tool) return `tool:${tool}`;
  const term = pathSlug(path, "/glossary");
  if (term) return `term:${term}`;
  const compare = pathSlug(path, "/compare");
  if (compare) return `entity:comparison:${compare}`;
  const problem = pathSlug(path, "/problem");
  if (problem) return `entity:problem:${problem}`;
  const question = pathSlug(path, "/question");
  if (question) return `entity:question:${question}`;
  const best = pathSlug(path, "/best");
  if (best) return `entity:best-for:${best}`;
  const guest = pathSlug(path, "/guests");
  if (guest) return `person:${guest}`;
  const entity = pathSlug(path, "/entity");
  if (entity) return `person:${entity}`;
  const event = pathSlug(path, "/plan");
  if (event) return `event:${event}`;
  return null;
}

export function GET() {
  const nodes = new Map<string, GraphNode>();
  const edgeKeys = new Set<string>();
  const rawEdges: GraphEdge[] = [];

  function upsertNode(n: GraphNode) {
    const existing = nodes.get(n.id);
    if (existing) {
      if (!existing.description && n.description) existing.description = n.description;
      if (!existing.url && n.url) existing.url = n.url;
      if (!existing.pillar && n.pillar) existing.pillar = n.pillar;
      if (!existing.subtype && n.subtype) existing.subtype = n.subtype;
      return;
    }
    nodes.set(n.id, n);
  }

  function pushEdge(source: string, target: string, relationship: string) {
    if (!source || !target || source === target) return;
    const key = `${source}::${target}::${relationship}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    rawEdges.push({ source, target, relationship });
  }

  // ----- Anthony Walsh: host node, referenced as author/expert across
  //       blog posts but never appears as a guest or expert entity. -----
  upsertNode({
    id: "person:anthony-walsh",
    type: "person",
    name: "Anthony Walsh",
    url: feedUrl("/entity/anthony-walsh"),
    description:
      "Host of the Roadman Cycling Podcast and founder of Roadman Cycling.",
  });

  // ----- TOPICS -----
  const topicSlugSet = new Set(getAllTopicSlugs());
  const topics = getAllTopics();
  for (const t of topics) {
    upsertNode({
      id: `topic:${t.slug}`,
      type: "topic",
      name: t.title,
      url: feedUrl(`/topics/${t.slug}`),
      description: summarise(t.description),
      pillar: t.pillar,
    });
    for (const rel of t.relatedTopics) {
      pushEdge(`topic:${t.slug}`, `topic:${rel}`, "related_to");
    }
    for (const tool of t.tools) {
      pushEdge(`topic:${t.slug}`, `tool:${tool.slug}`, "uses_tool");
    }
    for (const post of t.posts) {
      pushEdge(`topic:${t.slug}`, `article:${post.slug}`, "features_article");
    }
    for (const ep of t.episodes) {
      pushEdge(`topic:${t.slug}`, `episode:${ep.slug}`, "features_episode");
    }
  }

  // ----- TOOLS -----
  for (const tool of getAllTools()) {
    upsertNode({
      id: `tool:${tool.slug}`,
      type: "tool",
      name: tool.title,
      url: feedUrl(`/tools/${tool.slug}`),
      description: tool.description,
      pillar: tool.pillar,
    });
  }

  // ----- ARTICLES -----
  for (const meta of getAllPosts()) {
    const full = getPostBySlug(meta.slug);
    upsertNode({
      id: `article:${meta.slug}`,
      type: "article",
      name: meta.title,
      url: feedUrl(`/blog/${meta.slug}`),
      description: summarise(
        full?.answerCapsule || meta.seoDescription || meta.excerpt,
      ),
      pillar: meta.pillar,
    });

    if (meta.primaryHub && topicSlugSet.has(meta.primaryHub)) {
      pushEdge(`article:${meta.slug}`, `topic:${meta.primaryHub}`, "about_topic");
    }
    for (const t of getTopicsForPost(meta.slug)) {
      pushEdge(`article:${meta.slug}`, `topic:${t.slug}`, "about_topic");
    }
    for (const epSlug of meta.relatedEpisodes ?? []) {
      pushEdge(`article:${meta.slug}`, `episode:${epSlug}`, "related_to");
    }
    for (const entitySlug of meta.featuredEntities ?? []) {
      pushEdge(`article:${meta.slug}`, `person:${entitySlug}`, "mentions_expert");
    }
    if (full?.experts) {
      for (const ex of full.experts) {
        if (!ex?.name) continue;
        const slug = slugifyGuestName(ex.name);
        if (slug) pushEdge(`article:${meta.slug}`, `person:${slug}`, "mentions_expert");
      }
    }
    const authorName = meta.author || "Anthony Walsh";
    if (authorName) {
      const authorSlug = slugifyGuestName(authorName);
      if (authorSlug) {
        pushEdge(`article:${meta.slug}`, `person:${authorSlug}`, "authored_by");
      }
    }
  }

  // ----- EPISODES -----
  for (const ep of getAllEpisodes()) {
    upsertNode({
      id: `episode:${ep.slug}`,
      type: "episode",
      name: ep.title,
      url: feedUrl(`/podcast/${ep.slug}`),
      description: summarise(
        ep.answerCapsule || ep.seoDescription || ep.description,
      ),
      pillar: ep.pillar,
    });
    if (ep.guest && typeof ep.guest === "string") {
      const guestSlug = slugifyGuestName(ep.guest);
      if (guestSlug) pushEdge(`episode:${ep.slug}`, `person:${guestSlug}`, "guest_on");
    } else {
      pushEdge(`episode:${ep.slug}`, "person:anthony-walsh", "hosted_by");
    }
    for (const topicSlug of ep.topicTags ?? []) {
      pushEdge(`episode:${ep.slug}`, `topic:${topicSlug}`, "about_topic");
    }
    for (const post of ep.relatedPosts ?? []) {
      pushEdge(`episode:${ep.slug}`, `article:${post}`, "related_to");
    }
  }

  // ----- GUESTS (people) -----
  for (const g of getAllGuests()) {
    upsertNode({
      id: `person:${g.slug}`,
      type: "person",
      name: g.name,
      url: feedUrl(`/guests/${g.slug}`),
      description:
        g.credential ||
        `Featured on ${g.episodeCount} Roadman Cycling Podcast episode${g.episodeCount === 1 ? "" : "s"}.`,
      pillar: g.pillars[0],
    });
    for (const ep of g.episodes) {
      pushEdge(`person:${g.slug}`, `episode:${ep.slug}`, "appears_in");
    }
  }

  // ----- EXPERT ENTITIES (merged onto matching guest persons where
  //       slugs align; otherwise net-new person nodes) -----
  for (const ent of getAllEntities()) {
    const id = `person:${ent.slug}`;
    upsertNode({
      id,
      type: "person",
      name: ent.name,
      url: ent.guestSlug
        ? feedUrl(`/guests/${ent.guestSlug}`)
        : feedUrl(`/entity/${ent.slug}`),
      description: ent.shortBio,
    });
    for (const art of ent.relatedArticles ?? []) {
      pushEdge(id, `article:${art}`, "featured_in");
    }
    for (const epSlug of ent.relatedEpisodes ?? []) {
      pushEdge(id, `episode:${epSlug}`, "appears_in");
    }
    for (const topicSlug of ent.relatedTopicHubs ?? []) {
      pushEdge(id, `topic:${topicSlug}`, "knows_about");
    }
  }

  // ----- GLOSSARY TERMS -----
  const termSlugSet = new Set(GLOSSARY_TERMS.map((t) => t.slug));
  for (const term of GLOSSARY_TERMS) {
    upsertNode({
      id: `term:${term.slug}`,
      type: "term",
      name: term.term,
      url: feedUrl(`/glossary/${term.slug}`),
      description: summarise(term.definition),
      pillar: term.pillar,
    });
    const topicHubSlug = pathSlug(term.relatedTopicHub, "/topics");
    if (topicHubSlug) pushEdge(`term:${term.slug}`, `topic:${topicHubSlug}`, "defined_in");
    const artSlug = pathSlug(term.relatedArticle, "/blog");
    if (artSlug) pushEdge(`term:${term.slug}`, `article:${artSlug}`, "referenced_in");
    const toolSlug = pathSlug(term.relatedTool, "/tools");
    if (toolSlug) pushEdge(`term:${term.slug}`, `tool:${toolSlug}`, "uses_tool");
    for (const rel of term.relatedTerms ?? []) {
      if (termSlugSet.has(rel)) {
        pushEdge(`term:${term.slug}`, `term:${rel}`, "related_to");
      }
    }
  }

  // ----- COMPARISONS -----
  for (const c of COMPARISONS) {
    const id = `entity:comparison:${c.slug}`;
    upsertNode({
      id,
      type: "entity",
      subtype: "comparison",
      name: `${c.optionA} vs ${c.optionB}`,
      url: feedUrl(`/compare/${c.slug}`),
      description: summarise(c.verdict),
      pillar: c.pillar,
    });
    const relArt = pathSlug(c.relatedArticle, "/blog");
    if (relArt) pushEdge(id, `article:${relArt}`, "related_to");
    const relTool = pathSlug(c.relatedTool, "/tools");
    if (relTool) pushEdge(id, `tool:${relTool}`, "uses_tool");
  }

  // ----- PROBLEMS -----
  for (const p of PROBLEM_PAGES) {
    const id = `entity:problem:${p.slug}`;
    upsertNode({
      id,
      type: "entity",
      subtype: "problem",
      name: p.title,
      url: feedUrl(`/problem/${p.slug}`),
      description: summarise(p.problem),
      pillar: p.pillar,
    });
    const tool = pathSlug(p.toolHref, "/tools");
    if (tool) pushEdge(id, `tool:${tool}`, "uses_tool");
    for (const sol of p.solutions) {
      const target = nodeIdFromPath(sol.href);
      if (target) pushEdge(id, target, "recommends");
    }
  }

  // ----- QUESTIONS -----
  for (const q of QUESTION_PAGES) {
    const id = `entity:question:${q.slug}`;
    upsertNode({
      id,
      type: "entity",
      subtype: "question",
      name: q.question,
      url: feedUrl(`/question/${q.slug}`),
      description: summarise(q.shortAnswer),
      pillar: q.pillar,
    });
    for (const r of q.related ?? []) {
      const target = nodeIdFromPath(r.href);
      if (target) pushEdge(id, target, "related_to");
    }
  }

  // ----- BEST-FOR -----
  for (const b of BEST_FOR_PAGES) {
    const id = `entity:best-for:${b.slug}`;
    upsertNode({
      id,
      type: "entity",
      subtype: "best-for",
      name: b.title,
      url: feedUrl(`/best/${b.slug}`),
      description: summarise(b.intro),
      pillar: b.pillar,
    });
    for (const pick of b.picks) {
      const target = nodeIdFromPath(pick.href);
      if (target) pushEdge(id, target, "recommends");
    }
  }

  // ----- EVENTS -----
  for (const e of EVENTS) {
    const id = `event:${e.slug}`;
    upsertNode({
      id,
      type: "event",
      name: e.name,
      url: feedUrl(`/plan/${e.slug}`),
      description: summarise(e.description),
    });
    if (e.blogSlug) pushEdge(id, `article:${e.blogSlug}`, "covered_by_article");
  }

  // ----- Filter dangling edges (orphan source or target) -----
  const edges = rawEdges.filter(
    (e) => nodes.has(e.source) && nodes.has(e.target),
  );

  const nodeArr = Array.from(nodes.values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  const nodesByType: Record<string, number> = {};
  for (const n of nodeArr) {
    const key = n.subtype ? `${n.type}:${n.subtype}` : n.type;
    nodesByType[key] = (nodesByType[key] || 0) + 1;
  }
  const edgesByRelationship: Record<string, number> = {};
  for (const e of edges) {
    edgesByRelationship[e.relationship] =
      (edgesByRelationship[e.relationship] || 0) + 1;
  }

  return NextResponse.json(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        baseUrl: FEED_BASE_URL,
        schemaVersion: 1,
        nodeCount: nodeArr.length,
        edgeCount: edges.length,
        nodesByType,
        edgesByRelationship,
      },
      nodes: nodeArr,
      edges,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
