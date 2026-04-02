import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type ContentPillar } from "@/types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

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

export function getAllSlugs(): string[] {
  ensureBlogDir();
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
