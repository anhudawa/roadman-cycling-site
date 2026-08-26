import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const OWNER = "lachlan-morton-why-quit-world-tour";
const OWNER_PATH = `/blog/${OWNER}`;
const EPISODE =
  "ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton";
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Lachlan Morton entity and search owner", () => {
  it("turns the established owner into a current source-checked biography", () => {
    const article = matter(read(`content/blog/${OWNER}.mdx`));

    expect(article.data.seoTitle).toBe(
      "Lachlan Morton: Alt Tour, Unbound & EF Far Beyond",
    );
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.reviewedBy).toContain("EF Pro Cycling and UCI");
    expect(article.data.citedClaims).toHaveLength(5);
    expect(article.data.faq).toHaveLength(5);
    expect(article.content).toContain("## Lachlan Morton: quick facts");
    expect(article.content).toContain("## Sources and verification");
    expect(article.content).toContain("30 days, 9 hours and 59 minutes");
    expect(article.content).not.toContain(
      "This episode generated more direct messages",
    );
  });

  it("differentiates and corrects the first-person podcast source", () => {
    const episode = matter(read(`content/podcast/${EPISODE}.mdx`));

    expect(episode.data.seoTitle).toBe(
      "Why Lachlan Morton Left Road Racing | Interview",
    );
    expect(episode.data.updatedDate).toBe("2026-08-26");
    expect(episode.data.answerCapsule).toContain("not a permanent retirement");
    expect(episode.data.answerCapsule).toContain("2026 Far Beyond");
    expect(episode.data.faq).toHaveLength(5);
    expect(episode.data.citations).toHaveLength(7);
    expect(episode.data.guestSameAs).toEqual(
      expect.arrayContaining([
        "https://www.wikidata.org/wiki/Q2374213",
        "https://www.uci.org/rider-details/75973",
      ]),
    );
    expect(episode.content).toContain("UCI record establishes the team timeline");
    expect(episode.content).not.toContain(
      "left the WorldTour after his first 2-year contract at age 19-20",
    );
  });

  it("strengthens the Person support graph with current verified records", () => {
    const profiles = read("src/lib/guests/profiles.ts");
    const registry = read("src/data/canonical-entities.ts");
    const entity = matter(read("content/entities/lachlan-morton.mdx"));

    expect(profiles).toContain('lastReviewed: "2026-08-26"');
    expect(profiles).toContain("2026 Far Beyond programme");
    expect(profiles).toContain("https://www.uci.org/rider-details/75973");
    expect(profiles).toContain("https://www.wikidata.org/wiki/Q2374213");
    expect(registry).toContain(
      'title: "EF Pro Cycling Far Beyond rider; gravel and ultra-distance specialist"',
    );
    expect(entity.data.lastReviewed).toBe("2026-08-26");
    expect(entity.data.sameAs).toHaveLength(5);
    expect(entity.content).toContain("source-checked Lachlan Morton biography");
  });

  it("records the baseline and extends crawler and AI measurement", () => {
    const decision = read(
      "docs/seo/gsc-lachlan-morton-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("61 clicks");
    expect(decision).toContain("6,262 impressions");
    expect(decision).toContain("1.0% CTR");
    expect(decision).toContain("Average position 10.8");
    expect(decision).toContain("5,413");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Lachlan Morton: Alt Tour, Unbound and EF Far Beyond",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/guests/lachlan-morton",
      "/experts/lachlan-morton",
      "/entity/lachlan-morton",
      `/podcast/${EPISODE}`,
    ]) {
      expect(indexNow).toContain(path);
    }

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 232,
        target_page: OWNER_PATH,
        prompt:
          "who is Lachlan Morton and why did he leave traditional WorldTour road racing",
      }),
    );
  });
});
