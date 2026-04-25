/**
 * scripts/populate-related-episodes.ts
 *
 * Populates `relatedEpisodes` frontmatter on blog articles that don't
 * already have it. Uses the same keyword/pillar scoring as the site's
 * runtime related-content logic, then writes the top-N episode slugs
 * back to the MDX frontmatter.
 *
 * The blog/[slug] page renders this as a "Related Podcast Episodes"
 * section — creating explicit, author-curated-looking bidirectional
 * links between every blog article and 2–3 podcast episodes. Compounds
 * the internal link graph: 148 blog posts × 2.5 avg episode references
 * ≈ 370 new blog→podcast crawl paths.
 *
 * Idempotent: skips articles that already have relatedEpisodes populated.
 * --force overwrites.
 *
 * CLI:
 *   pnpm run seo:related-episodes
 *   pnpm run seo:related-episodes --dry
 *   pnpm run seo:related-episodes --force
 *   pnpm run seo:related-episodes --slug=<slug>
 *
 * No API calls — pure keyword/pillar matching against the local
 * episode catalogue. Safe to run offline.
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

interface EpisodeMeta {
  slug: string;
  title: string;
  pillar: string;
  keywords: string[];
  guest?: string;
  guestCredential?: string;
  publishDate: string;
}

function loadEpisodes(): EpisodeMeta[] {
  const files = fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(PODCAST_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        pillar: String(data.pillar ?? ""),
        keywords: Array.isArray(data.keywords)
          ? (data.keywords as string[])
          : [],
        guest: typeof data.guest === "string" ? data.guest : undefined,
        guestCredential:
          typeof data.guestCredential === "string"
            ? data.guestCredential
            : undefined,
        publishDate: String(data.publishDate ?? ""),
      };
    })
    .filter((ep) => ep.publishDate);
}

function scoreEpisode(
  article: { pillar: string; keywords: string[]; title: string },
  ep: EpisodeMeta,
): number {
  let score = 0;

  // Pillar match is the strongest signal.
  if (ep.pillar === article.pillar) score += 10;

  // Keyword overlap (case-insensitive, exact + substring).
  const articleKw = article.keywords.map((k) => k.toLowerCase());
  const epKw = ep.keywords.map((k) => k.toLowerCase());
  for (const a of articleKw) {
    for (const e of epKw) {
      if (e === a) score += 4;
      else if (e.includes(a) || a.includes(e)) score += 2;
    }
  }

  // Title-word overlap. Words >3 chars only to filter out noise.
  const titleWords = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  const articleTitleWords = titleWords(article.title);
  const epTitleWords = titleWords(ep.title);
  for (const aw of articleTitleWords) {
    if (epTitleWords.includes(aw)) score += 1;
  }

  // Small recency boost — prefer recent episodes when quality is tied.
  const age = Date.now() - new Date(ep.publishDate).getTime();
  if (age < 1000 * 60 * 60 * 24 * 365) score += 0.5; // < 1 year

  return score;
}

function findRelatedEpisodes(
  article: { pillar: string; keywords: string[]; title: string },
  episodes: EpisodeMeta[],
): string[] {
  const scored = episodes
    .map((ep) => ({ ep, score: scoreEpisode(article, ep) }))
    .filter((s) => s.score >= 6) // minimum threshold — noise floor
    .sort((a, b) => b.score - a.score);

  // Deduplicate by guest — avoid three episodes with the same guest
  // unless there's nothing else.
  const seenGuests = new Set<string>();
  const picked: string[] = [];
  for (const { ep } of scored) {
    if (picked.length >= TARGET_COUNT) break;
    if (ep.guest && seenGuests.has(ep.guest)) continue;
    if (ep.guest) seenGuests.add(ep.guest);
    picked.push(ep.slug);
  }
  return picked;
}

function main() {
  console.log(`📎 Populate relatedEpisodes on blog articles`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  console.log("");

  const episodes = loadEpisodes();
  console.log(`   Episodes in catalogue: ${episodes.length}`);

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => !f.endsWith(".draft.mdx"));

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");
    if (slugFilter && slug !== slugFilter) continue;

    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (
      !force &&
      Array.isArray(data.relatedEpisodes) &&
      data.relatedEpisodes.length > 0
    ) {
      skipped++;
      continue;
    }

    const article = {
      pillar: String(data.pillar ?? ""),
      keywords: Array.isArray(data.keywords)
        ? (data.keywords as string[])
        : [],
      title: String(data.title ?? slug),
    };

    const related = findRelatedEpisodes(article, episodes);
    if (related.length === 0) {
      noMatch++;
      console.log(`   (no match) ${slug}`);
      continue;
    }

    if (dryRun) {
      console.log(`   [DRY] ${slug}`);
      related.forEach((r) => console.log(`      → ${r}`));
      continue;
    }

    const updatedFrontmatter = {
      ...data,
      relatedEpisodes: related,
    };
    const output = matter.stringify(content, updatedFrontmatter);
    fs.writeFileSync(filePath, output, "utf-8");
    updated++;
    console.log(`   ✓ ${slug} (${related.length})`);
  }

  console.log("");
  console.log(`✓ Complete.`);
  console.log(`  Updated:           ${updated}`);
  console.log(`  Skipped (already): ${skipped}`);
  console.log(`  No match found:    ${noMatch}`);
}

main();
