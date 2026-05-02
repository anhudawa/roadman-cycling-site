import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type ContentPillar } from "@/types";
import { type CitedClaim } from "@/components/ui/CitedClaimTable";
import { type EvidenceLevelType } from "@/components/ui/EvidenceLevel";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ExpertSource {
  name: string;
  role?: string;
  href?: string;
}

export type { CitedClaim, EvidenceLevelType };

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
  faq?: FaqItem[];
  answerCapsule?: string;
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
  limit: number = 3
): BlogPostMeta[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Score each post by relevance: pillar match + keyword overlap
  const scored = allPosts.map((post) => {
    let score = 0;
    if (post.pillar === pillar) score += 10;
    const postKeywords = new Set(post.keywords.map((k) => k.toLowerCase()));
    for (const kw of keywords) {
      if (postKeywords.has(kw.toLowerCase())) score += 3;
    }
    return { post, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAllSlugs(): string[] {
  ensureBlogDir();
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
