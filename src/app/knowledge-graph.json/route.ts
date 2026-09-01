import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests, slugifyGuestName } from "@/lib/guests";
import { getAllTopics, getAllTopicSlugs, getTopicsForPost } from "@/lib/topics";
import { getAllEntities } from "@/lib/entities";
import { GLOSSARY_TERMS, getGlossaryTermPath } from "@/lib/glossary";
import { COMPARISONS } from "@/lib/comparisons";
import { PROBLEM_PAGES } from "@/lib/problems";
import { QUESTION_PAGES } from "@/lib/questions";
import { BEST_FOR_PAGES } from "@/lib/best-for";
import { EVENTS } from "@/lib/training-plans";
import { getAllTools } from "@/lib/tools-registry";
import { getExpertsWithTopics, getExpertTopic } from "@/lib/experts";
import { SEARCH_OWNERS } from "@/lib/seo/search-ownership";
import { getResearchAssetCatalog } from "@/data/research-assets";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
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
 * on the site (people, topics, tools, software, episodes, articles, glossary
 * terms, training events, and the entity sub-types — comparisons,
 * problems, questions, best-for picks) plus the typed relationships
 * between them.
 *
 * Goes beyond the per-type feeds at /feeds/*.json by giving AI agents
 * one document where they can traverse "guest → episode → topic →
 * article → research asset → glossary term → tool" without re-stitching
 * shape-mismatched payloads.
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
  | "research-asset"
  | "software"
  | "entity";

interface GraphNode {
  id: string;
  type: NodeType;
  /** Sub-classification for entity, research-asset and software nodes. */
  subtype?: string;
  name: string;
  url: string | null;
  description?: string;
  /** Roadman content pillar — present where the source carries it. */
  pillar?: string;
  /** Versioned research-asset fields. Unset on other node types. */
  version?: string;
  updatedDate?: string;
  dataUrl?: string;
  limitations?: readonly string[];
  reuseTerms?: string;
  /** Product identity fields. Unset on non-software nodes. */
  applicationCategory?: string;
  operatingSystems?: readonly string[];
  lifecycleStatus?: string;
  audience?: string;
  earlyAccessUrl?: string;
  features?: readonly string[];
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
   *   - about_expert            (expert-topic page → person)
   *   - maintained_by           (search owner → person)
   *   - documented_by           (research asset → method/article page)
   *   - supported_by            (search owner → supporting evidence)
   *   - supports_owner          (supporting evidence → search owner)
   *   - developed_by            (software → organization)
   *   - represented_by          (software → canonical search owner)
   *   - represents_product      (canonical search owner → software)
   *   - previewed_by            (software → public deterministic tool)
   *   - compared_in             (software → category comparison)
   *   - supports_product        (evidence article → software)
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
  const normalisedPath = path.replace(/^https?:\/\/[^/]+/i, "").replace(/\/$/, "") || "/";
  const owner = SEARCH_OWNERS.find(
    (candidate) => candidate.path.replace(/\/$/, "") === normalisedPath,
  );
  if (owner) return `entity:search-owner:${owner.id}`;
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

  // ----- ROADMAN ORGANIZATION & UPCOMING APP -----
  // The search-owner node tells agents which URL owns broad product intent;
  // this software node describes the actual product. Keeping them separate
  // avoids treating a ranking policy as the product itself and gives the
  // prelaunch app one stable identity before its final public name exists.
  const roadmanOrganizationId = "entity:organization:roadman-cycling";
  upsertNode({
    id: roadmanOrganizationId,
    type: "entity",
    subtype: "organization",
    name: "Roadman Cycling",
    url: feedUrl("/entity/roadman-cycling"),
    description:
      "Cycling media, coaching and athlete-education organization founded by Anthony Walsh.",
  });
  pushEdge(roadmanOrganizationId, "person:anthony-walsh", "founded_by");

  upsertNode({
    id: ROADMAN_APP_PRODUCT.graphId,
    type: "software",
    subtype: "mobile-application",
    name: ROADMAN_APP_PRODUCT.name,
    url: ROADMAN_APP_PRODUCT.canonicalUrl,
    description: ROADMAN_APP_PRODUCT.description,
    updatedDate: ROADMAN_APP_PRODUCT.updatedDate,
    applicationCategory: ROADMAN_APP_PRODUCT.applicationCategory,
    operatingSystems: ROADMAN_APP_PRODUCT.operatingSystems,
    lifecycleStatus: ROADMAN_APP_PRODUCT.lifecycleStatus,
    audience: ROADMAN_APP_PRODUCT.audience,
    earlyAccessUrl: ROADMAN_APP_PRODUCT.earlyAccessUrl,
    features: ROADMAN_APP_PRODUCT.features,
    limitations: ROADMAN_APP_PRODUCT.limitations,
  });
  pushEdge(ROADMAN_APP_PRODUCT.graphId, roadmanOrganizationId, "developed_by");
  pushEdge(
    ROADMAN_APP_PRODUCT.graphId,
    "person:anthony-walsh",
    "maintained_by",
  );

  const appOwnerId = "entity:search-owner:cycling-strength-recovery-app";
  pushEdge(ROADMAN_APP_PRODUCT.graphId, appOwnerId, "represented_by");
  pushEdge(appOwnerId, ROADMAN_APP_PRODUCT.graphId, "represents_product");

  for (const topicSlug of ROADMAN_APP_PRODUCT.topicSlugs) {
    pushEdge(ROADMAN_APP_PRODUCT.graphId, `topic:${topicSlug}`, "about_topic");
  }
  for (const toolSlug of ROADMAN_APP_PRODUCT.previewToolSlugs) {
    pushEdge(ROADMAN_APP_PRODUCT.graphId, `tool:${toolSlug}`, "previewed_by");
  }
  for (const comparisonSlug of ROADMAN_APP_PRODUCT.comparisonSlugs) {
    pushEdge(
      ROADMAN_APP_PRODUCT.graphId,
      `entity:best-for:${comparisonSlug}`,
      "compared_in",
    );
  }
  for (const articleSlug of ROADMAN_APP_PRODUCT.evidenceArticleSlugs) {
    const articleId = `article:${articleSlug}`;
    pushEdge(ROADMAN_APP_PRODUCT.graphId, articleId, "supported_by");
    pushEdge(articleId, ROADMAN_APP_PRODUCT.graphId, "supports_product");
  }

  // ----- CANONICAL SEARCH OWNERS -----
  // Broad podcast, coaching, masters, plan and camp intent must resolve to a
  // first-class owner before an agent traverses the thousands of supporting
  // documents. Bidirectional edges preserve both discovery directions:
  // owner → evidence and ranking/supporting page → definitive owner.
  for (const owner of SEARCH_OWNERS) {
    const ownerNodeId = `entity:search-owner:${owner.id}`;
    upsertNode({
      id: ownerNodeId,
      type: "entity",
      subtype: "search-owner",
      name: owner.label,
      url: feedUrl(owner.path),
      description: owner.description,
    });
    pushEdge(ownerNodeId, "person:anthony-walsh", "maintained_by");

    for (const destination of owner.supportingDestinations) {
      const supportingNodeId = nodeIdFromPath(destination.path);
      if (!supportingNodeId) continue;
      pushEdge(ownerNodeId, supportingNodeId, "supported_by");
      pushEdge(supportingNodeId, ownerNodeId, "supports_owner");
    }
  }

  // ----- VERSIONED RESEARCH & EVIDENCE ASSETS -----
  // These nodes describe the reusable asset, not merely the page that
  // documents it. The subtype preserves the claim boundary: datasets,
  // archive studies, coaching frameworks and evidence benchmarks are not
  // interchangeable. Blog-hosted method pages remain article nodes and are
  // connected with documented_by rather than being silently duplicated.
  const researchTopics: Record<string, readonly string[]> = {
    "amateur-cycling-performance-report-2026": [
      "ftp-training",
      "masters-cycling",
    ],
    "cycling-podcast-archive-study-2026": [],
    "sportive-readiness-index-2026": [
      "race-preparation",
      "cycling-training-plans",
    ],
    "amateur-cyclist-fuelling-benchmarks-2026": ["cycling-nutrition"],
  };

  for (const asset of getResearchAssetCatalog()) {
    const assetNodeId = `research-asset:${asset.id}`;
    upsertNode({
      id: assetNodeId,
      type: "research-asset",
      subtype: asset.kind,
      name: asset.name,
      url: asset.canonicalUrl,
      dataUrl: asset.dataUrl,
      description: summarise(asset.summary),
      version: asset.version,
      updatedDate: asset.updatedDate,
      limitations: asset.limitations,
      reuseTerms: asset.reuse.terms,
    });
    pushEdge(assetNodeId, "person:anthony-walsh", "maintained_by");

    const methodPageNodeId = nodeIdFromPath(asset.canonicalPath);
    if (methodPageNodeId) {
      pushEdge(assetNodeId, methodPageNodeId, "documented_by");
    }

    for (const topicSlug of researchTopics[asset.id] ?? []) {
      pushEdge(assetNodeId, `topic:${topicSlug}`, "about_topic");
    }
  }

  // Structured evidence can support a broad owner without competing for the
  // owner's query intent.
  pushEdge(
    "research-asset:cycling-podcast-archive-study-2026",
    "entity:search-owner:cycling-podcast",
    "supports_owner",
  );
  pushEdge(
    "entity:search-owner:cycling-podcast",
    "research-asset:cycling-podcast-archive-study-2026",
    "supported_by",
  );
  pushEdge(
    "research-asset:sportive-readiness-index-2026",
    "entity:search-owner:cycling-training-plans",
    "supports_owner",
  );
  pushEdge(
    "entity:search-owner:cycling-training-plans",
    "research-asset:sportive-readiness-index-2026",
    "supported_by",
  );

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

  // ----- BRAND / EDITORIAL PROPERTIES -----
  //  Static `/entity/*` pages that aren't in the MDX entity registry
  //  (getAllEntities only reads content/entities/*.mdx). Against the Clock
  //  is Roadman's cycling × horology property — modelled as an `entity`
  //  node so AI agents can traverse property → hub → flagship feature.
  {
    const atcId = "entity:property:against-the-clock";
    upsertNode({
      id: atcId,
      type: "entity",
      subtype: "property",
      name: "Against the Clock",
      url: feedUrl("/entity/against-the-clock"),
      description:
        "Roadman Cycling's cycling × horology property — the culture, history and identity where cycling meets fine watchmaking: the Hour Record, the time trial's race of truth, and the watches that end up on a rider's wrist.",
      pillar: "community",
    });
    pushEdge(atcId, "topic:against-the-clock", "related_to");
    pushEdge(
      atcId,
      "article:against-the-clock-cycling-watches",
      "features_article",
    );
    pushEdge(atcId, "person:anthony-walsh", "related_to");
  }

  // ----- NEW-TOOL WIRING -----
  //  tool:* nodes are created automatically from the registry, but they
  //  only acquire edges when a topic/term/problem/comparison references
  //  them. The two newest calculators aren't yet referenced by any of
  //  those data sources, so without this block they'd sit in the graph as
  //  orphans. Wire them to the topics and articles they actually serve.
  //  These are graph-only edges — they do NOT add a tool strip to the hub
  //  pages (that lives in TOPIC_ENRICHMENT in src/lib/topics.ts). The
  //  dangling-edge filter at the end drops any target that doesn't
  //  resolve, so this stays safe if an article is renamed or removed.
  {
    // Race Time Predictor — physics-based finish-time from power + course.
    const racePredictor = "tool:race-predictor";
    for (const topic of [
      "topic:ftp-training",
      "topic:cycling-training-plans",
      "topic:triathlon-cycling",
      "topic:against-the-clock",
    ]) {
      pushEdge(topic, racePredictor, "uses_tool");
    }
    for (const art of [
      "article:ride-faster-less-effort-cycling-durability",
      "article:sweet-spot-training-cycling-guide",
      "article:cycling-pacing-strategy-long-climbs",
    ]) {
      pushEdge(art, racePredictor, "uses_tool");
    }
    // The Against the Clock property is built on the race of truth — the
    // time trial and Hour Record — so the finish-time predictor is its
    // natural calculator.
    pushEdge(
      "entity:property:against-the-clock",
      racePredictor,
      "uses_tool",
    );

    // Cycling Fuel Planner — fuel-for-the-work-required day/session plan.
    const fuelPlanner = "tool:fuel-planner";
    for (const topic of [
      "topic:cycling-nutrition",
      "topic:cycling-weight-loss",
      "topic:triathlon-cycling",
    ]) {
      pushEdge(topic, fuelPlanner, "uses_tool");
    }
    for (const art of [
      "article:gut-training-cycling-absorb-more-carbs",
      "article:electrolytes-sweat-rate-cycling",
      "article:bonking-cycling-what-happens-how-to-prevent",
      "article:post-ride-recovery-nutrition-cyclists",
      "article:menopause-cycling-fuelling-female-cyclists",
    ]) {
      pushEdge(art, fuelPlanner, "uses_tool");
    }
  }

  // ----- EXPERT × TOPIC PAGES (/experts/[expert]/[topic]) -----
  //  The programmatic AEO layer in src/lib/experts.ts ("what {expert} says
  //  about {topic}"). Built from getExpertsWithTopics()/getExpertTopic()
  //  — pure registry lookups — rather than getExpertTopicPage(), which
  //  rebuilds the full page (episode/quote scans across the whole catalogue)
  //  and is far too heavy to run per-pair inside a feed route. Each page
  //  links to its expert and its parent topic hub; the episodes it draws on
  //  stay reachable transitively via those two nodes.
  for (const expert of getExpertsWithTopics()) {
    for (const t of expert.topics) {
      const topic = getExpertTopic(t.slug);
      if (!topic) continue;
      const id = `entity:expert-topic:${expert.slug}--${t.slug}`;
      upsertNode({
        id,
        type: "entity",
        subtype: "expert-topic",
        name: `What ${expert.name} says about ${topic.label}`,
        url: feedUrl(`/experts/${expert.slug}/${t.slug}`),
        description: summarise(topic.blurb),
        pillar: topic.pillar,
      });
      pushEdge(id, `person:${expert.slug}`, "about_expert");
      pushEdge(id, `topic:${topic.parentHub}`, "about_topic");
    }
  }

  // ----- GLOSSARY TERMS -----
  const termSlugSet = new Set(GLOSSARY_TERMS.map((t) => t.slug));
  for (const term of GLOSSARY_TERMS) {
    upsertNode({
      id: `term:${term.slug}`,
      type: "term",
      name: term.term,
      url: feedUrl(getGlossaryTermPath(term)),
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
        schemaVersion: 3,
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
