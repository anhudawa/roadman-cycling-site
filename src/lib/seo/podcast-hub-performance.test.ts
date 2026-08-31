import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

interface HubRecord {
  slug: string;
  title: string;
  episodeNumber: number;
  description: string;
  publishDate: string;
  duration: string;
  pillar: string;
  type: string;
  transcript?: string;
  content?: string;
  answerCapsule?: string;
}

describe("podcast hub compact delivery", () => {
  const index = JSON.parse(
    read("src/generated/podcast-hub-index.json"),
  ) as HubRecord[];

  it("covers every episode without carrying transcript-scale fields", () => {
    const sourceCount = readdirSync(resolve(root, "content/podcast")).filter(
      (name) => name.endsWith(".mdx"),
    ).length;

    expect(index).toHaveLength(sourceCount);
    expect(index.length).toBeGreaterThan(800);
    expect(new Set(index.map((episode) => episode.slug)).size).toBe(
      index.length,
    );

    for (const episode of index) {
      expect(episode.slug).toBeTruthy();
      expect(episode.title).toBeTruthy();
      expect(episode.description).toBeTruthy();
      expect(episode.transcript).toBeUndefined();
      expect(episode.content).toBeUndefined();
      expect(episode.answerCapsule).toBeUndefined();
    }
  });

  it("keeps request-time transcript parsing out of the canonical hub", () => {
    const page = read("src/app/(content)/podcast/page.tsx");
    const compactLoader = read("src/lib/podcast-hub-index.ts");
    const packageJson = read("package.json");

    expect(page).toContain("getPodcastHubIndex");
    expect(page).not.toContain("getAllEpisodes");
    expect(compactLoader).toContain("podcast-hub-index.json");
    expect(packageJson).toContain("npm run podcast:hub-index");
    expect(packageJson).toContain(
      '"podcast:hub-index": "tsx scripts/generate-podcast-hub-index.ts"',
    );
  });
});
