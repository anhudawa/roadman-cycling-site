import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_SLUG =
  "ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training";
const OWNER_PATH = `/podcast/${OWNER_SLUG}`;

describe("Jonas Abrahamsen episode search owner", () => {
  it("keeps the established URL and corrects the Tour record", () => {
    const episode = matter(read(`content/podcast/${OWNER_SLUG}.mdx`));

    expect(episode.data.seoTitle).toBe(
      "Jonas Abrahamsen: 2025 Tour Win & 18kg Gain",
    );
    expect(episode.data.updatedDate).toBe("2026-08-26");
    expect(episode.data.answerCapsule).toContain("Stage 11 of the 2025");
    expect(episode.data.answerCapsule).toContain("self-reported");
    expect(episode.data.answerCapsule).not.toContain("2024 Tour de France stage win");
    expect(episode.content).toContain("Verified record and source boundary");
    expect(episode.content).toContain("16 July 2025");
    expect(episode.content).not.toContain("2024 Tour de France stage winner");
  });

  it("separates interview claims from the matching group study", () => {
    const episode = matter(read(`content/podcast/${OWNER_SLUG}.mdx`));
    const profile = read("src/lib/guests/profiles.ts");

    expect(episode.data.faq).toHaveLength(5);
    expect(episode.data.faq[2].answer).toContain("42g, or 4.6%");
    expect(episode.data.faq[2].answer).toContain(
      "not find a statistically greater improvement in VO2 max",
    );
    expect(episode.data.citations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://doi.org/10.1113/EP088544" }),
        expect.objectContaining({
          url: "https://www.letour.fr/en/news/2025/abrahamsen-what-a-first/1328895",
        }),
      ]),
    );
    expect(episode.data.keyQuotes[0].text).not.toContain("we max");
    expect(profile).toContain("the paper does not publish that individual result");
    expect(profile).toContain('lastReviewed: "2026-08-26"');
  });

  it("strengthens the support entity without replacing the episode owner", () => {
    const registry = read("src/data/canonical-entities.ts");
    expect(registry).toContain("https://www.wikidata.org/wiki/Q23013999");
    expect(registry).toContain(
      'title: "Professional cyclist; 2025 Tour de France stage winner"',
    );
    expect(registry).toContain(`"${OWNER_SLUG}"`);

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Jonas Abrahamsen: 2025 Tour Win, 18kg Gain and Pro Training",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/guests/jonas-abrahamsen",
      "/experts/jonas-abrahamsen",
      "/podcast/ep-3-is-losing-weight-actually-making-you-slower",
    ]) {
      expect(indexNow).toContain(path);
    }
  });

  it("records the baseline and extends AI measurement", () => {
    const decision = read(
      "docs/seo/gsc-jonas-abrahamsen-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("61 clicks");
    expect(decision).toContain("6,479 impressions");
    expect(decision).toContain("0.9% CTR");
    expect(decision).toContain("Average position 9.5");
    expect(decision).toContain("6,179");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 230,
        target_page: OWNER_PATH,
        prompt:
          "who is Jonas Abrahamsen and how did gaining 18kg change his cycling performance",
      }),
    );
  });
});
