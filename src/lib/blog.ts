import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type ContentPillar } from "@/types";
import { type CitedClaim } from "@/components/ui/CitedClaimTable";
import { type EvidenceLevelType } from "@/components/ui/EvidenceLevel";
import { type ClaimReviewItem } from "@/components/seo/ClaimReviewSchema";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Resolve a frontmatter `featuredImage` to itself only when the file
// actually exists on disk under /public. Otherwise return undefined so
// the existing Satori/typography fallback (`isGenericImage(undefined)`
// → branded card) kicks in instead of rendering a broken <img>.
// Skips http(s) URLs and any non-root-absolute path.
function resolveFeaturedImage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return value;
  const onDisk = path.join(PUBLIC_DIR, value);
  return fs.existsSync(onDisk) ? value : undefined;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ExpertSource {
  name: string;
  role?: string;
  href?: string;
}

export interface ReviewedSource {
  name: string;
  href: string;
  publisher?: string;
  note?: string;
}

export interface HowToStepItem {
  name: string;
  text: string;
}

export interface HowToContent {
  /** Defaults to the post title when omitted. */
  name?: string;
  /** Defaults to the post seoDescription when omitted. */
  description?: string;
  /** ISO 8601 duration, e.g. "PT20M". */
  totalTime?: string;
  steps: HowToStepItem[];
}

export type { CitedClaim, EvidenceLevelType, ClaimReviewItem };

export interface BlogFrontmatter {
  title: string;
  seoTitle?: string;
  seoDescription: string;
  excerpt: string;
  pillar: ContentPillar;
  // Slug of the topic hub this article primarily belongs to (matches a
  // TOPIC_DEFINITIONS entry in src/lib/topics.ts). Drives the contextual
  // hub link rendered near the top of the article. When omitted, the
  // page falls back to the first topic resolved via getTopicsForPost()
  // — so existing posts mapped through TOPIC_POST_MAP keep working
  // unchanged. Set this explicitly when a post belongs to multiple
  // topics and you want to override the implicit "first match" choice.
  primaryHub?: string;
  author: string;
  publishDate: string;
  updatedDate?: string;
  featuredImage?: string;
  keywords: string[];
  relatedEpisodes?: string[];
  // Author-curated sibling articles, by slug. When present, these take
  // priority over the pillar/keyword heuristic in getRelatedPosts() so the
  // on-page "Related Posts" strip shows hand-picked siblings rather than
  // whatever else happens to share the article's broad pillar. Validated by
  // scripts/audit-today.ts (each slug must resolve to a real post).
  relatedPosts?: string[];
  faq?: FaqItem[];
  answerCapsule?: string;
  // 2-3 brief, scannable takeaways rendered inside the AnswerCapsule as a
  // semantic <ul>. Designed to give AI crawlers (ChatGPT, Perplexity,
  // Google AI Overviews) a structured bullet list to extract alongside
  // the one-sentence answer. Kept short — each takeaway should stand on
  // its own and read like a claim, not a sentence fragment.
  keyTakeaways?: string[];
  // E-E-A-T: experts cited or interviewed in the article. When present,
  // overrides the default Anthony-only experts entry on the EvidenceBlock
  // and shows readers (and search engines) which named authorities the
  // article's claims are grounded in.
  experts?: ExpertSource[];
  // Slugs of expert-network entity pages (`content/entities/*.mdx`) the
  // article leans on. Renders the visible "Featured experts" strip in
  // the top 30% of the article and pushes Person @ids into Article
  // JSON-LD `mentions`. Bidirectional link to /entity/[slug].
  featuredEntities?: string[];
  // E-E-A-T: explicit human review trail. Falls back to updatedDate /
  // publishDate when omitted.
  reviewedBy?: string;
  lastReviewed?: string;
  // Primary references checked during the latest editorial review. Rendered
  // as visible outbound citations in the article trust block so readers and
  // retrieval systems can inspect the evidence rather than infer it from a
  // generic review label.
  reviewedSources?: ReviewedSource[];
  // Optional structured claim table — rendered after the AnswerCapsule
  // and before the article body when present. Each row is a claim →
  // Roadman position → evidence source → practical implication, with
  // an optional `evidenceLevel` (strong | moderate | emerging |
  // anecdotal) chip. Gives readers a scannable trust signal and AI
  // crawlers a structured claim graph at the top of the page.
  citedClaims?: CitedClaim[];
  claimsHeading?: string;
  claimsCaption?: string;
  // Optional evidence-level callout for the whole article (rendered
  // alongside the AnswerCapsule). Use when one level dominates the
  // piece; for mixed-strength articles, attach levels per claim row
  // via citedClaims instead.
  evidenceLevel?: EvidenceLevelType;
  evidenceNote?: string;
  // Optional ClaimReview entries for myth-busting / contrarian posts.
  // Each rates one claim the article corrects; rendered as ClaimReview
  // JSON-LD (no visible UI). Editor-authored — keep ratings measured and
  // claimReviewed phrased as the myth, not Roadman's counter-position.
  claimReviews?: ClaimReviewItem[];
  // Optional HowTo structured data for procedural posts (test protocols,
  // step-by-step plans). Emitted as HowTo JSON-LD; name/description fall
  // back to the post title / seoDescription when omitted.
  howTo?: HowToContent;
  // Content series support. When both fields are set, articles with the
  // same `seriesSlug` are grouped into an ordered series and a "Part X
  // of Y" navigation component is rendered. `seriesOrder` is 1-indexed.
  seriesSlug?: string;
  seriesOrder?: number;
  // Optional human-readable series title, e.g. "Zone 2 Deep Dive".
  // Defaults to the seriesSlug title-cased in the UI if omitted.
  seriesTitle?: string;
  // "Who this is for" — audience descriptors rendered as a bullet list
  // above the article body (mirrors the answer-page pattern). When
  // present, signals to both readers and AI crawlers exactly which
  // cyclist profile the article targets. Each entry should stand alone
  // as a full descriptor, e.g. "Masters cyclists over 40 training
  // 8-12 hours per week".
  whoFor?: string[];
  // "The Roadman View" — editorial stance points rendered as a
  // left-bordered callout above the article body (mirrors the answer-
  // page pattern). Each entry is one opinionated position, e.g.
  // "We believe intensity matters more than volume after 40".
  roadmanView?: string[];
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  readTime: string;
}

export interface BlogPostFull extends BlogPostMeta {
  content: string;
}

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

// Build-time memoisation of the parsed blog corpus. Mirrors getAllEpisodes()
// in podcast.ts: called many times per page across thousands of pages
// (directly and via the content graph), so re-reading and parsing all ~370
// post files on every call was a major contributor to the `next build`
// per-page timeout. Cached only in production so the dev server still
// reflects content edits without a restart; callers get a shallow copy.
let allPostsCache: BlogPostMeta[] | null = null;

// Kept on disk for editorial history, but removed from archives, feeds,
// search, sitemaps and AI exports because a permanent owner now handles it.
export const RETIRED_BLOG_SLUGS = new Set([
  "tour-de-france-2026-complete-guide",
]);

function normalizeStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object") {
      return Object.entries(item).map(([lead, tail]) =>
        typeof tail === "string" ? `${lead}: ${tail}` : lead,
      );
    }
    return [];
  });
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSlugList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (
      item &&
      typeof item === "object" &&
      "slug" in item &&
      typeof item.slug === "string"
    ) {
      return [item.slug];
    }
    return [];
  });
  return normalized.length > 0 ? normalized : undefined;
}

export function getAllPosts(): BlogPostMeta[] {
  if (allPostsCache) return allPostsCache.slice();

  ensureBlogDir();
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => !RETIRED_BLOG_SLUGS.has(f.replace(/\.mdx$/, "")));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as BlogFrontmatter;
    const stats = readingTime(content);

    return {
      ...frontmatter,
      keywords: normalizeStringList(frontmatter.keywords) ?? [],
      relatedEpisodes: normalizeSlugList(frontmatter.relatedEpisodes),
      relatedPosts: normalizeSlugList(frontmatter.relatedPosts),
      featuredEntities: normalizeSlugList(frontmatter.featuredEntities),
      whoFor: normalizeStringList(frontmatter.whoFor),
      roadmanView: normalizeStringList(frontmatter.roadmanView),
      keyTakeaways: normalizeStringList(frontmatter.keyTakeaways),
      featuredImage: resolveFeaturedImage(frontmatter.featuredImage),
      slug,
      readTime: stats.text,
    };
  });

  const sorted = posts.sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  if (process.env.NODE_ENV === "production") allPostsCache = sorted;
  return sorted.slice();
}

export function getPostBySlug(slug: string): BlogPostFull | null {
  if (RETIRED_BLOG_SLUGS.has(slug)) return null;

  ensureBlogDir();
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as BlogFrontmatter;
  const stats = readingTime(content);

  return {
    ...frontmatter,
    keywords: normalizeStringList(frontmatter.keywords) ?? [],
    relatedEpisodes: normalizeSlugList(frontmatter.relatedEpisodes),
    relatedPosts: normalizeSlugList(frontmatter.relatedPosts),
    featuredEntities: normalizeSlugList(frontmatter.featuredEntities),
    whoFor: normalizeStringList(frontmatter.whoFor),
    roadmanView: normalizeStringList(frontmatter.roadmanView),
    keyTakeaways: normalizeStringList(frontmatter.keyTakeaways),
    featuredImage: resolveFeaturedImage(frontmatter.featuredImage),
    slug,
    readTime: stats.text,
    content,
  };
}

export function getPostsByPillar(pillar: ContentPillar): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.pillar === pillar);
}

export function getRelatedPosts(
  currentSlug: string,
  pillar: ContentPillar,
  keywords: string[],
  limit: number = 3,
  curatedSlugs?: string[],
): BlogPostMeta[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Author-curated `relatedPosts` (frontmatter) take priority over the
  // pillar/keyword heuristic — a hand-picked sibling beats an algorithmic
  // guess, and stops broad-pillar posts (e.g. a horology feature in the
  // `community` pillar) from surfacing unrelated community articles like
  // doping or gravel guides. Resolve curated slugs against real posts,
  // then top up with scored matches if the curated list is short.
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const curated: BlogPostMeta[] = [];
  const taken = new Set<string>([currentSlug]);
  for (const s of curatedSlugs ?? []) {
    const match = bySlug.get(s);
    if (match && !taken.has(s)) {
      curated.push(match);
      taken.add(s);
    }
  }
  if (curated.length >= limit) return curated.slice(0, limit);

  // Score each remaining post by relevance: pillar match + keyword overlap.
  // `?? []` guards against MDX files whose frontmatter is missing the
  // required `keywords` array — without it, one bad file would crash
  // the prerender of every blog page that calls getRelatedPosts.
  const filled = allPosts
    .filter((p) => !taken.has(p.slug))
    .map((post) => {
      let score = 0;
      if (post.pillar === pillar) score += 10;
      const postKeywords = new Set(
        (post.keywords ?? []).map((k) => k.toLowerCase()),
      );
      for (const kw of keywords ?? []) {
        if (postKeywords.has(kw.toLowerCase())) score += 3;
      }
      return { post, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.post);

  return [...curated, ...filled].slice(0, limit);
}

export function getAllSlugs(): string[] {
  ensureBlogDir();
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Returns all posts belonging to the given series, ordered by
 * `seriesOrder`. Only posts that have both `seriesSlug` and
 * `seriesOrder` set are included.
 */
export function getSeriesPosts(seriesSlug: string): BlogPostMeta[] {
  return getAllPosts()
    .filter(
      (p) =>
        p.seriesSlug === seriesSlug &&
        typeof p.seriesOrder === "number",
    )
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}
