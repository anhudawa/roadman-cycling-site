import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

type Chapter = { timestamp: string; title: string };

const PRIORITY_EPISODES = [
  {
    slug: "ep-2170-eva-lovia-i-had-to-transform-my-life-after-porn",
    minimumChapters: 10,
  },
  {
    slug: "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
    minimumChapters: 8,
  },
  {
    slug: "ep-18-the-rise-and-fall-of-peloton-the-50-billion-fail",
    minimumChapters: 6,
  },
  {
    slug: "armstrong-stripped-ullrich-kept-1997-tour-title",
    minimumChapters: 8,
  },
  {
    slug: "ep-2036-5-exercises-pogacar-always-does-before-a-ride",
    minimumChapters: 6,
  },
  {
    slug: "ep-2064-5-easy-fixes-for-numb-hands-while-cycling",
    minimumChapters: 8,
  },
] as const;

function toSeconds(value: string): number {
  return value
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

function readEpisode(slug: string) {
  const raw = readFileSync(
    resolve(process.cwd(), `content/podcast/${slug}.mdx`),
    "utf8",
  );

  return matter(raw).data as {
    duration: string;
    youtubeId: string;
    updatedDate?: string;
    chapters: Chapter[];
    segmentTitles?: string[];
  };
}

describe("high-AI-impression podcast chapter contracts", () => {
  it.each(PRIORITY_EPISODES)(
    "keeps $slug navigable with ordered chapters inside the episode duration",
    ({ slug, minimumChapters }) => {
      const episode = readEpisode(slug);
      const offsets = episode.chapters.map((chapter) =>
        toSeconds(chapter.timestamp),
      );
      const titles = episode.chapters.map((chapter) => chapter.title);

      expect(episode.youtubeId).toBeTruthy();
      expect(episode.chapters.length).toBeGreaterThanOrEqual(minimumChapters);
      expect(offsets[0]).toBe(0);
      expect(offsets.at(-1)).toBeLessThan(toSeconds(episode.duration));
      expect(offsets.every((offset, index) => index === 0 || offset > offsets[index - 1])).toBe(true);
      expect(new Set(titles).size).toBe(titles.length);
      expect(titles.every((title) => title.trim().length >= 12)).toBe(true);
    },
  );

  it("describes the mixed listener-support episode beyond its opening question", () => {
    const episode = readEpisode(
      "ep-2064-5-easy-fixes-for-numb-hands-while-cycling",
    );
    const titles = episode.chapters.map((chapter) => chapter.title).join(" ");

    expect(episode.updatedDate).toBe("2026-08-25");
    expect(episode.segmentTitles).toHaveLength(episode.chapters.length);
    expect(titles).toContain("stage-race");
    expect(titles).toContain("Strava KOM");
    expect(titles).toContain("brake rotors");
  });
});
