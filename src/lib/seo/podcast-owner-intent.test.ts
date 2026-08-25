import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { resolveSearchOwner } from "./search-ownership";

const EXPECTED_UNTAGGED_COACHING_EPISODES = [
  "ep-16-5-things-pros-secretly-do-in-winter-that-you-don-t",
  "training-intensity-how-much-is-too-much",
  "using-your-power-meter-to-win-races",
  "why-ill-always-remember-the-year-2020",
  "why-new-year-resolutions-fail",
  "why-zwift-doesnt-work-cycling-coaching-is-dead",
  "why-zwift-is-a-waste-of-time",
].sort();

function episodeOwner(slug: string) {
  const raw = readFileSync(
    resolve(process.cwd(), `content/podcast/${slug}.mdx`),
    "utf8",
  );
  const data = matter(raw).data;
  const values = [
    data.title,
    data.seoTitle,
    data.seoDescription,
    ...(data.keywords ?? []),
    ...(data.topicTags ?? []),
  ];

  return {
    owner: resolveSearchOwner(values, {
      currentPath: `/podcast/${slug}`,
      fallbackId: "cycling-podcast",
    })?.id,
    topicTags: data.topicTags ?? [],
  };
}

describe("podcast search-owner intent", () => {
  it.each([
    "ep-18-the-rise-and-fall-of-peloton-the-50-billion-fail",
    "tyler-hamilton-forgiveness-and-rebirth",
    "what-do-you-need-to-bring-bike-packing",
    "what-supplements-should-you-take",
  ])("keeps non-coaching episode %s under the podcast owner", (slug) => {
    expect(episodeOwner(slug).owner).toBe("cycling-podcast");
  });

  it("keeps the untagged coaching-owner exceptions deliberate and finite", () => {
    const podcastDir = resolve(process.cwd(), "content/podcast");
    const untaggedCoachingEpisodes = readdirSync(podcastDir)
      .filter((name) => name.endsWith(".mdx"))
      .map((name) => name.slice(0, -4))
      .filter((slug) => {
        const result = episodeOwner(slug);
        return (
          result.owner === "cycling-coaching" &&
          !result.topicTags.includes("cycling-coaching")
        );
      })
      .sort();

    expect(untaggedCoachingEpisodes).toEqual(
      EXPECTED_UNTAGGED_COACHING_EPISODES,
    );
  });

  it.each([
    "ep-2-5-fixable-mistakes-self-coached-cyclists-make",
    "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
    "why-zwift-doesnt-work-cycling-coaching-is-dead",
  ])("retains genuine coaching support from %s", (slug) => {
    expect(episodeOwner(slug).owner).toBe("cycling-coaching");
  });
});
