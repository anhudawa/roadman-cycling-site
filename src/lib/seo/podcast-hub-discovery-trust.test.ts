import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/(content)/podcast/page";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("podcast hub topical discovery trust", () => {
  const page = read("src/app/(content)/podcast/page.tsx");
  const search = read("src/components/features/podcast/PodcastSearch.tsx");

  it("publishes a topic-led, self-canonical page-one snippet", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(metadata.title).toEqual({
      absolute: "Roadman Cycling Podcast: Training, Nutrition & Racing",
    });
    expect(metadata.description).toContain("810+");
    expect(metadata.description).toContain("bike fit");
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/podcast",
    );
  });

  it("searches the complete archive while preserving default pagination", () => {
    expect(page).toContain("const podcastSearchIndex = allEpisodes.map");
    expect(page).toContain("const episodes = podcastSearchIndex.slice(start, end)");
    expect(page).toContain("searchIndex={podcastSearchIndex}");
    expect(page).toContain("Search all {allEpisodes.length} on-site episodes");
    expect(search).toContain("searchIndex = episodes");
    expect(search).toContain("searchingArchive ? searchIndex : episodes");
    expect(search).toContain("const MAX_ARCHIVE_RESULTS = 100");
    expect(search).toContain("filtered.slice(0, MAX_ARCHIVE_RESULTS)");
  });

  it("declares topical routes and ownership without cannibalising episodes", () => {
    for (const target of [
      "/blog/best-cycling-podcasts-2026",
      "/topics/ftp-training",
      "/topics/cycling-nutrition",
      "/masters",
      "/topics/bike-fitting",
      "/guests",
      "/watch",
    ]) {
      expect(page).toContain(target);
    }
    expect(page).toContain(
      "This is the canonical show page and full on-site episode",
    );
    expect(page).toContain(
      "Individual episode pages own their guest and topic",
    );
    expect(page).toContain(
      "owns independent listening recommendations",
    );
  });

  it("strengthens the podcast entity and disambiguation graph", () => {
    for (const signal of [
      "PODCAST_SAME_AS",
      'alternateName: "Roadman Podcast"',
      "disambiguatingDescription",
      'name: "Cycling training"',
      'name: "Cycling nutrition"',
      'name: "Bicycle fitting"',
      'audienceType: "Amateur and masters cyclists"',
      'genre: ["Cycling", "Endurance sports", "Sports science"]',
    ]) {
      expect(page).toContain(signal);
    }
  });

  it("records the GSC decision, AI prompt and priority submission", () => {
    const decision = read(
      "docs/seo/gsc-podcast-hub-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "5,250 impressions",
      "47 clicks",
      "0.9% CTR",
      "average position 8.7",
      "cycling nutrition podcast",
      "20 episodes",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 218, target_page: "/podcast" }),
      ]),
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "`https://${HOST}/podcast`",
    );
  });
});
