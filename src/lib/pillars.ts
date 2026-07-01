import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts, type BlogPostMeta } from "./blog";
import { type ContentPillar } from "@/types";

const PILLARS_DIR = path.join(process.cwd(), "content/pillars");

export interface PillarPage {
  slug: string;
  pillar: ContentPillar;
  title: string;
  seoTitle: string;
  seoDescription: string;
  headline: string;
  description: string;
  keywords: string[];
  featuredPostSlugs: string[];
  /** Raw MDX source for the pillar prose. */
  content: string;
  /** All blog posts tagged with this pillar. */
  posts: BlogPostMeta[];
  /** The subset of posts specified in featuredPostSlugs, in order. */
  featuredPosts: BlogPostMeta[];
}

/**
 * Load a single pillar page by slug. Returns null if the MDX file
 * does not exist.
 */
export function getPillarBySlug(slug: string): PillarPage | null {
  const filePath = path.join(PILLARS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const allPosts = getAllPosts();
  const pillarPosts = allPosts.filter(
    (p) => p.pillar === (data.pillar as ContentPillar)
  );

  const featuredSlugs: string[] = data.featuredPostSlugs ?? [];
  const featuredPosts = featuredSlugs
    .map((s) => pillarPosts.find((p) => p.slug === s))
    .filter(Boolean) as BlogPostMeta[];

  return {
    slug,
    pillar: data.pillar as ContentPillar,
    title: data.title as string,
    seoTitle: data.seoTitle as string,
    seoDescription: data.seoDescription as string,
    headline: data.headline as string,
    description: data.description as string,
    keywords: (data.keywords as string[]) ?? [],
    featuredPostSlugs: featuredSlugs,
    content,
    posts: pillarPosts,
    featuredPosts,
  };
}

/**
 * Return all pillar slugs for static generation.
 */
export function getAllPillarSlugs(): string[] {
  if (!fs.existsSync(PILLARS_DIR)) return [];
  return fs
    .readdirSync(PILLARS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Return all pillar pages, hydrated.
 */
export function getAllPillars(): PillarPage[] {
  return getAllPillarSlugs()
    .map(getPillarBySlug)
    .filter(Boolean) as PillarPage[];
}
