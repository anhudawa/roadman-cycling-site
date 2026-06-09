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

export function getAllPosts(): BlogPostMeta[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as BlogFrontmatter;
    const stats = readingTime(content);

    return {
      ...frontmatter,
      featuredImage: resolveFeaturedImage(frontmatter.featuredImage),
      slug,
      readTime: stats.text,
    };
  });

  return posts.sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPostFull | null {
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
      for (const kw of keywords) {
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
