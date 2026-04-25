#!/usr/bin/env tsx
// Rebuild agents/ted/data/episode-topic-map.json from content/podcast/ frontmatter.
//
// Strategy: read only the frontmatter block (skip the massive transcript field),
// sort by publishDate desc, group by pillar, take the top N per topic. Run this
// whenever the podcast catalogue grows materially $— Ted's thread-surface links
// get better as the pool grows.
//
// Usage:  npx tsx agents/ted/scripts/rebuild-topic-map.ts
//         npx tsx agents/ted/scripts/rebuild-topic-map.ts --per-topic=20 --dry-run

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const perTopic = Number(args.find((a) => a.startsWith("--per-topic="))?.split("=")[1] ?? 15);

// Map Roadman podcast "pillar" frontmatter to Ted topic tags.
const PILLAR_TO_TOPIC: Record<string, string> = {
  coaching: "endurance",
  nutrition: "nutrition",
  strength: "strength",
  recovery: "recovery",
  community: "culture",
};

interface EpisodeEntry {
  slug: string;
  title: string;
  guest?: string;
  relevance: string;
  publishDate: string;
  episodeNumber: number;
}

interface TopicMap {
  _meta: {
    description: string;
    generatedAt: string;
    perTopic: number;
    sourceEpisodes: number;
  };
  [topic: string]: unknown;
}

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "package.json")) && fs.existsSync(path.join(dir, "content/podcast"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

/** Read only the frontmatter block $— stop at the first `---\n` after the second one. */
function readFrontmatter(filePath: string): Record<string, unknown> | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    const { data } = matter(raw);
    return data;
  } catch {
    return null;
  }
}

function relevanceFromDescription(desc: string | undefined, title: string): string {
  if (!desc) return title;
  const cleaned = desc.replace(/\s+/g, " ").trim();
  return cleaned.length > 160 ? cleaned.slice(0, 157) + "..." : cleaned;
}

function main() {
  const repoRoot = findRepoRoot();
  const podcastDir = path.join(repoRoot, "content/podcast");
  const mapPath = path.join(repoRoot, "agents/ted/data/episode-topic-map.json");

  const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));
  console.log(`Reading ${files.length} podcast MDX files...`);

  const byTopic: Record<string, EpisodeEntry[]> = {
    endurance: [],
    nutrition: [],
    strength: [],
    recovery: [],
    culture: [],
  };

  let read = 0;
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, "");
    const fm = readFrontmatter(path.join(podcastDir, f));
    if (!fm) continue;

    const pillar = String(fm.pillar ?? "");
    const topic = PILLAR_TO_TOPIC[pillar];
    if (!topic) continue;

    const title = String(fm.title ?? "");
    const publishDate = String(fm.publishDate ?? "");
    const episodeNumber = Number(fm.episodeNumber ?? 0);
    const guest = fm.guestName ? String(fm.guestName) : undefined;
    const description = fm.seoDescription ? String(fm.seoDescription) : undefined;

    if (!title || !publishDate) continue;

    byTopic[topic].push({
      slug,
      title,
      guest,
      relevance: relevanceFromDescription(description, title),
      publishDate,
      episodeNumber,
    });
    read += 1;
  }

  // Sort each topic by publishDate desc, take top N
  for (const topic of Object.keys(byTopic)) {
    byTopic[topic].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
    byTopic[topic] = byTopic[topic].slice(0, perTopic);
  }

  const output: TopicMap = {
    _meta: {
      description:
        "Top podcast episodes mapped to topics Ted uses for thread-surfacing replies. Rebuilt from content/podcast/ frontmatter. Regenerate via `npx tsx agents/ted/scripts/rebuild-topic-map.ts`.",
      generatedAt: new Date().toISOString().slice(0, 10),
      perTopic,
      sourceEpisodes: read,
    },
  };

  // Strip publishDate/episodeNumber from the committed JSON $— they're only
  // needed for sorting here. Keep slug/title/guest/relevance for the generator.
  for (const [topic, list] of Object.entries(byTopic)) {
    output[topic] = list.map((e) => ({
      slug: e.slug,
      title: e.title,
      ...(e.guest ? { guest: e.guest } : {}),
      relevance: e.relevance,
    }));
  }

  const json = JSON.stringify(output, null, 2) + "\n";

  console.log(`Topics:`);
  for (const [topic, list] of Object.entries(byTopic)) {
    console.log(`  ${topic.padEnd(12)} ${list.length} entries`);
  }
  console.log(`Source episodes classified: ${read}`);

  if (dryRun) {
    console.log(`\n--- DRY RUN: would write to ${mapPath} (${json.length} bytes) ---\n`);
    return;
  }

  fs.writeFileSync(mapPath, json);
  console.log(`\nWrote ${mapPath}`);
}

main();
