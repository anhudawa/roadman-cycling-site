import { type ContentPillar } from "@/types";
import { getAllPosts, type BlogPostMeta } from "./blog";
import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { getAllTools, type ToolEntry } from "./tools-registry";

// ============================================
// Internal-linking engine — funnel-stage routing
// ============================================
//
// Models every content surface as a stage in the awareness → comparison
// → tools → coaching journey, then resolves three context-aware links
// per page:
//
//   - lateral    : same-stage same-pillar (deeper exploration)
//   - forward    : next-stage content (tool to apply, coaching to commit)
//   - destination: the offer-ladder endpoint, picked by current stage
//                  (Plateau Diagnostic for top-of-funnel, /apply or
//                  /inner-circle for tools/coaching stages)
//
// The resolver is pure — it reads the content registries (blog,
// podcast, tools, personas) and returns links. The renderer
// (`<JourneyLinks>`) is in src/components/features/JourneyLinks.tsx.

export type FunnelStage =
  | "awareness"   // top-of-funnel: most blog posts, podcast episodes
  | "comparison"  // X vs Y posts, methodology decision pages
  | "tools"       // calculators, tool result pages
  | "coaching";   // /apply, /coaching, /inner-circle

export type JourneyContentType = "blog" | "podcast" | "tool" | "persona";

export type PersonaSlug = "plateau" | "event" | "comeback" | "listener";

export interface JourneyDestination {
  /** Which offer-ladder endpoint we're routing to. */
  kind: "plateau-diagnostic" | "inner-circle" | "apply" | "clubhouse";
  href: string;
  /** Eyebrow label, e.g. "WHEN YOU'RE READY" */
  eyebrow: string;
  /** Headline, e.g. "Get the diagnostic." */
  headline: string;
  /** Body copy, 1-2 sentences */
  body: string;
  /** Button text */
  ctaLabel: string;
}

export interface JourneyLink {
  href: string;
  label: string;
  /** Display hint — "ARTICLE", "TOOL", "PODCAST", "COMPARISON" */
  kind: "article" | "tool" | "podcast" | "comparison" | "topic" | "persona";
  description?: string;
  pillar?: ContentPillar;
}

export interface JourneyResult {
  currentStage: FunnelStage;
  /** 0-2 same-stage same-pillar links (lateral exploration). */
  lateral: JourneyLink[];
  /** 0-2 next-stage links (forward funnel motion). */
  forward: JourneyLink[];
  /** Final offer-ladder destination, picked by current stage + pillar. */
  destination: JourneyDestination;
}

export interface JourneyInput {
  currentType: JourneyContentType;
  currentSlug: string;
  /** Display title — used to detect comparison-style content for blog posts. */
  currentTitle?: string;
  pillar: ContentPillar;
  keywords?: string[];
  /** Persona signal (only set for /you/[slug] pages). */
  persona?: PersonaSlug;
}

// ============================================
// Stage classification
// ============================================

/**
 * Heuristic: a blog post is a "comparison" when its slug contains
 * "-vs-" / "-versus-", or its title leads with "X vs Y" framing.
 * Everything else (guides, how-tos, opinion pieces) is awareness.
 */
function isComparisonSlug(slug: string, title?: string): boolean {
  if (/(^|-)(vs|versus)(-|$)/i.test(slug)) return true;
  if (title && /\bvs\.?\s|\bversus\b/i.test(title)) return true;
  return false;
}

export function classifyStage(input: {
  type: JourneyContentType;
  slug: string;
  title?: string;
}): FunnelStage {
  if (input.type === "tool") return "tools";
  if (input.type === "persona") return "awareness";
  if (input.type === "blog" && isComparisonSlug(input.slug, input.title)) {
    return "comparison";
  }
  return "awareness";
}

// ============================================
// Pillar → tool mapping (forward bridges)
// ============================================
//
// Picks the most relevant calculator for each pillar. When the current
// content's pillar has a tool, the journey forward-link is "go run
// the numbers". This is the awareness→tools bridge that the SEO audit
// flagged as missing.

const PILLAR_TOOL_PRIORITY: Record<ContentPillar, string[]> = {
  coaching: ["ftp-zones", "hr-zones", "wkg", "tyre-pressure"],
  nutrition: ["fuelling", "race-weight", "energy-availability"],
  strength: ["wkg", "race-weight"],
  recovery: ["energy-availability", "fuelling"],
  community: ["race-weight", "tyre-pressure", "shock-pressure"],
};

function getPrimaryToolForPillar(
  pillar: ContentPillar,
  excludeSlug?: string,
): ToolEntry | null {
  const order = PILLAR_TOOL_PRIORITY[pillar] ?? [];
  const tools = getAllTools();
  for (const slug of order) {
    if (slug === excludeSlug) continue;
    const t = tools.find((x) => x.slug === slug);
    if (t) return t;
  }
  // Fall back to any same-pillar tool, then any non-current tool
  const samePillar = tools.find(
    (t) => t.pillar === pillar && t.slug !== excludeSlug,
  );
  if (samePillar) return samePillar;
  return tools.find((t) => t.slug !== excludeSlug) ?? null;
}

// ============================================
// Lateral content scoring
// ============================================
//
// Mirrors the existing `getRelatedContent` weights so journey links
// stay aligned with the rest of the site's relatedness signals:
//   - same pillar: +10
//   - exact keyword match: +3
//   - partial keyword overlap: +1
//   - same stage: +5 (lateral preference)
//   - opposite stage same pillar: +2 (forward bridge candidate)

function scorePost(
  post: BlogPostMeta,
  input: JourneyInput,
  preferStage: FunnelStage,
): number {
  let score = 0;
  if (post.pillar === input.pillar) score += 10;

  const inputKeywords = (input.keywords ?? []).map((k) => k.toLowerCase());
  const postKeywords = post.keywords.map((k) => k.toLowerCase());
  for (const a of inputKeywords) {
    for (const b of postKeywords) {
      if (a === b) score += 3;
      else if (a.includes(b) || b.includes(a)) score += 1;
    }
  }

  const postStage = classifyStage({ type: "blog", slug: post.slug });
  if (postStage === preferStage) score += 5;

  return score;
}

function scoreEpisode(ep: EpisodeMeta, input: JourneyInput): number {
  let score = 0;
  if (ep.pillar === input.pillar) score += 10;

  const inputKeywords = (input.keywords ?? []).map((k) => k.toLowerCase());
  const epKeywords = ep.keywords.map((k) => k.toLowerCase());
  for (const a of inputKeywords) {
    for (const b of epKeywords) {
      if (a === b) score += 3;
      else if (a.includes(b) || b.includes(a)) score += 1;
    }
  }
  return score;
}

function topPosts(
  input: JourneyInput,
  preferStage: FunnelStage,
  limit: number,
): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => {
    if (input.currentType === "blog" && p.slug === input.currentSlug) {
      return false;
    }
    return true;
  });
  return all
    .map((p) => ({ post: p, score: scorePost(p, input, preferStage) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

function topEpisodes(input: JourneyInput, limit: number): EpisodeMeta[] {
  const all = getAllEpisodes().filter((e) => {
    if (input.currentType === "podcast" && e.slug === input.currentSlug) {
      return false;
    }
    return true;
  });
  return all
    .map((e) => ({ ep: e, score: scoreEpisode(e, input) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.ep);
}

function postToLink(post: BlogPostMeta): JourneyLink {
  const isComp = isComparisonSlug(post.slug, post.title);
  return {
    href: `/blog/${post.slug}`,
    label: post.title,
    kind: isComp ? "comparison" : "article",
    description: post.excerpt,
    pillar: post.pillar,
  };
}

function episodeToLink(ep: EpisodeMeta): JourneyLink {
  return {
    href: `/podcast/${ep.slug}`,
    label: ep.title,
    kind: "podcast",
    description: ep.guest ? `with ${ep.guest}` : ep.description,
    pillar: ep.pillar,
  };
}

function toolToLink(tool: ToolEntry): JourneyLink {
  return {
    href: `/tools/${tool.slug}`,
    label: tool.title,
    kind: "tool",
    description: tool.description,
    pillar: tool.pillar,
  };
}

// ============================================
// Destination resolver (offer ladder)
// ============================================
//
// Picks the right end-of-journey CTA based on stage + pillar + persona:
//
//   - awareness / comparison → /plateau (top-of-funnel diagnostic)
//   - tools / coaching       → /apply (hot CTA)
//   - persona-driven:
//       * plateau persona    → /plateau (already in the funnel)
//       * comeback persona   → /apply (warmest persona)
//       * event persona      → /apply (high-intent)
//       * listener persona   → /plateau (cold-warm bridge)
//   - non-coaching pillars on tools/coaching stages → /inner-circle as
//     a softer ladder rung (community vs 1:1 coaching)

function resolveDestination(
  stage: FunnelStage,
  input: JourneyInput,
): JourneyDestination {
  // Persona-driven override (only fires when input.persona is set)
  if (input.persona) {
    if (input.persona === "plateau") return DEST_PLATEAU;
    if (input.persona === "comeback") return DEST_APPLY;
    if (input.persona === "event") return DEST_APPLY;
    if (input.persona === "listener") return DEST_PLATEAU;
  }

  if (stage === "awareness" || stage === "comparison") {
    // Top of funnel — the diagnostic is the lowest-friction next step
    return DEST_PLATEAU;
  }

  // Tools and coaching stages — go straight to the application
  if (input.pillar === "coaching") return DEST_APPLY;
  // Non-coaching pillars get the softer Inner Circle community pitch
  return DEST_INNER_CIRCLE;
}

const DEST_PLATEAU: JourneyDestination = {
  kind: "plateau-diagnostic",
  href: "/plateau",
  eyebrow: "WHEN YOU'RE READY",
  headline: "Find out what's actually holding you back.",
  body: "The Masters Plateau Diagnostic — six questions, a personalised breakdown of where your training is leaking watts. Free, two minutes.",
  ctaLabel: "Take the Diagnostic",
};

const DEST_APPLY: JourneyDestination = {
  kind: "apply",
  href: "/apply",
  eyebrow: "READY FOR A REAL PLAN?",
  headline: "Apply for Not Done Yet coaching.",
  body: "Personalised plan, weekly calls, the five-pillar system. Same principles every Roadman conversation has been pointing at — structured into your week. 7-day free trial.",
  ctaLabel: "Apply — 7-Day Free Trial",
};

const DEST_INNER_CIRCLE: JourneyDestination = {
  kind: "inner-circle",
  href: "/inner-circle",
  eyebrow: "THE NEXT STEP",
  headline: "Join the Inner Circle.",
  body: "The serious-cyclist coaching community — weekly live calls with Anthony, Vekta-powered training, masterclasses with World Tour coaches.",
  ctaLabel: "See the Inner Circle",
};

// ============================================
// Main resolver
// ============================================

export function resolveJourney(input: JourneyInput): JourneyResult {
  const stage = classifyStage({
    type: input.currentType,
    slug: input.currentSlug,
    title: input.currentTitle,
  });

  // Lateral: same-stage same-pillar deeper-reading suggestions
  const lateral: JourneyLink[] = topPosts(input, stage, 2).map(postToLink);

  // Forward: next-stage links — the actual funnel motion
  const forward: JourneyLink[] = [];

  if (stage === "awareness") {
    // awareness → comparison (if any pillar comparison exists), then tool
    const comparisons = topPosts({ ...input }, "comparison", 1);
    if (comparisons.length > 0) forward.push(postToLink(comparisons[0]));
    const tool = getPrimaryToolForPillar(input.pillar);
    if (tool) forward.push(toolToLink(tool));
  } else if (stage === "comparison") {
    // comparison → tool (run the numbers) → coaching CTA (handled as destination)
    const tool = getPrimaryToolForPillar(input.pillar);
    if (tool) forward.push(toolToLink(tool));
    // Add one same-pillar awareness piece for context
    const eps = topEpisodes(input, 1);
    if (eps[0]) forward.push(episodeToLink(eps[0]));
  } else if (stage === "tools") {
    // tools → "what does this mean for my training" content + podcast
    const excludeTool =
      input.currentType === "tool" ? input.currentSlug : undefined;
    // First: a blog post that explains the methodology behind this tool
    const posts = topPosts(input, "awareness", 1);
    if (posts[0]) forward.push(postToLink(posts[0]));
    // Second: a related podcast episode for depth
    const eps = topEpisodes(input, 1);
    if (eps[0]) forward.push(episodeToLink(eps[0]));
    // If we still have room and there's another relevant tool, suggest it
    if (forward.length < 2) {
      const altTool = getPrimaryToolForPillar(input.pillar, excludeTool);
      if (altTool && altTool.slug !== excludeTool) {
        forward.push(toolToLink(altTool));
      }
    }
  } else {
    // coaching stage — minimal forward, destination carries the weight
    const eps = topEpisodes(input, 1);
    if (eps[0]) forward.push(episodeToLink(eps[0]));
  }

  return {
    currentStage: stage,
    lateral,
    forward: forward.slice(0, 2),
    destination: resolveDestination(stage, input),
  };
}

/** Exposed for tests / debug pages — re-exports the internals. */
export const __INTERNAL__ = {
  isComparisonSlug,
  scorePost,
  PILLAR_TOOL_PRIORITY,
  DEST_PLATEAU,
  DEST_APPLY,
  DEST_INNER_CIRCLE,
};
