/**
 * scripts/populate-episode-related-posts.ts
 *
 * Inverse of populate-related-episodes.ts. Scores every blog post
 * against each episode (pillar + keywords + title words), picks the
 * top 3, and writes the slugs back to each episode's MDX frontmatter
 * as `relatedPosts`.
 *
 * Rendered on /podcast/[slug] as a "Read the Guide" section →
 * explicit episode→blog crawl paths to complement the blog→episode
 * paths already populated.
 *
 * Idempotent. --force overwrites.
 *
 * CLI:
 *   pnpm run seo:episode-related-posts
 *   pnpm run seo:episode-related-posts:dry
 *   pnpm run seo:episode-related-posts --force
 *   pnpm run seo:episode-related-posts --slug=<episode-slug>
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry") || args.includes("--dry-run");
const force = args.includes("--force");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const TARGET_COUNT = 3;

interface PostMeta {
  slug: string;
  title: string;
  pillar: string;
  keywords: string[];
  publishDate: string;
}

function loadPosts(): PostMeta[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith(".draft.mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        pillar: String(data.pillar ?? ""),
        keywords: Array.isArray(data.keywords)
          ? (data.keywords as string[])
          : [],
        publishDate: String(data.publishDate ?? ""),
      };
    });
}

function scorePost(
  episode: { pillar: string; keywords: string[]; title: string },
  post: PostMeta,
): number {
  let score = 0;
  if (post.pillar === episode.pillar) score += 10;

  const epKw = episode.keywords.map((k) => k.toLowerCase());
  const postKw = post.keywords.map((k) => k.toLowerCase());
  for (const a of epKw) {
    for (const b of postKw) {
      if (a === b) score += 4;
      else if (a.includes(b) || b.includes(a)) score += 2;
    }
  }

  const words = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  const epTitleWords = words(episode.title);
  const postTitleWords = words(post.title);
  for (const w of epTitleWords) {
    if (postTitleWords.includes(w)) score += 1;
  }

  // Small freshness boost — we'd rather link at newer blog content
  // than articles from 2021.
  if (post.publishDate) {
    const age = Date.now() - new Date(post.publishDate).getTime();
    if (age < 1000 * 60 * 60 * 24 * 365) score += 0.5;
  }

  return score;
}

function findRelatedPosts(
  episode: { pillar: string; keywords: string[]; title: string },
  posts: PostMeta[],
): string[] {
  const scored = posts
    .map((p) => ({ p, score: scorePost(episode, p) }))
    .filter((s) => s.score >= 6)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, TARGET_COUNT).map((s) => s.p.slug);
}

function main() {
  console.log(`📎 Populate relatedPosts on podcast episodes`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  console.log("");

  const posts = loadPosts();
  console.log(`   Blog posts in catalogue: ${posts.length}`);

  const files = fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"));

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");
    if (slugFilter && slug !== slugFilter) continue;

    const filePath = path.join(PODCAST_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (
      !force &&
      Array.isArray(data.relatedPosts) &&
      data.relatedPosts.length > 0
    ) {
      skipped++;
      continue;
    }

    const episode = {
      pillar: String(data.pillar ?? ""),
      keywords: Array.isArray(data.keywords)
        ? (data.keywords as string[])
        : [],
      title: String(data.title ?? slug),
    };

    const related = findRelatedPosts(episode, posts);
    if (related.length === 0) {
      noMatch++;
      continue;
    }

    if (dryRun) {
      console.log(`   [DRY] ${slug}`);
      related.forEach((r) => console.log(`      → ${r}`));
      continue;
    }

    fs.writeFileSync(
      filePath,
      matter.stringify(content, { ...data, relatedPosts: related }),
      "utf-8",
    );
    updated++;
  }

  console.log("");
  console.log(`✓ Complete.`);
  console.log(`  Updated:           ${updated}`);
  console.log(`  Skipped (already): ${skipped}`);
  console.log(`  No match found:    ${noMatch}`);
}

main();
