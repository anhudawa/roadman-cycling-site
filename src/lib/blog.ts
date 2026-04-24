import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type ContentPillar } from "@/types";

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

export interface BlogFrontmatter {
  title: string;
  seoTitle?: string;
  seoDescription: string;
  excerpt: string;
  pillar: ContentPillar;
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
  // E-E-A-T: explicit human review trail. Falls back to updatedDate /
  // publishDate when omitted.
  reviewedBy?: string;
  lastReviewed?: string;
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
