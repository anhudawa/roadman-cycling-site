import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { getHistoryArticle } from "@/data/tour-history";

const OWNER = "greg-lemond-interview-roadman-podcast";
const OWNER_PATH = `/blog/${OWNER}`;
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Greg LeMond entity and CTR owner", () => {
  it("turns the established owner into a current, source-bounded biography", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe("Greg LeMond: Tour Wins, Comeback & Interview");
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("official Tour de France, UCI and US government records");
    expect(data.keywords).toEqual(expect.arrayContaining(["greg lemond", "who is greg lemond"]));
    expect(data.relatedEpisodes).toHaveLength(5);
    expect(data.citedClaims).toHaveLength(5);
    expect(content.startsWith("\n**Greg LeMond is an American former professional cyclist")).toBe(true);
    expect(content).toContain("## Greg LeMond: quick facts");
    expect(content).toContain("## Congressional Gold Medal");
    expect(content).toContain("## Sources and verification");
    expect(raw).not.toContain("Thirty-seven pellets");
    expect(raw).not.toContain("a million people");
  });

  it("differentiates the guest and Tour-history support pages around the owner", () => {
    const profiles = read("src/lib/guests/profiles.ts");
    const history = getHistoryArticle("greg-lemond-eight-seconds");

    expect(profiles).toContain('seoTitle: "Greg LeMond: Podcast Guest & Episodes"');
    expect(profiles).toContain(`"${OWNER}"`);
    expect(history?.seoTitle).toBe("Greg LeMond 1989 Tour: The 8-Second Win");
    expect(history?.updated).toBe("2026-08-26");
    expect(history?.sources).toHaveLength(3);
    expect(history?.body).toContain(`[source-checked Greg LeMond biography](${OWNER_PATH})`);
    expect(history?.body).not.toContain("around three dozen shotgun pellets");
    expect(history?.body).not.toContain("He out-shaped him");
  });

  it("records the GSC baseline and extends AI and crawler discovery", () => {
    const decision = read("docs/seo/gsc-greg-lemond-opportunity-2026-08-25.md");
    expect(decision).toContain("44 clicks");
    expect(decision).toContain("11,539 impressions");
    expect(decision).toContain("0.4% CTR");
    expect(decision).toContain("Average position 10.8");
    expect(decision).toContain("10,072");
    expect(decision).toContain("**4 September 2026**");
    expect(decision).toContain("**25 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Greg LeMond: Three Tours, the 8-Second Comeback",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/guests/greg-lemond",
      "/experts/greg-lemond",
      "/podcast/ep-2210-my-untold-story-of-epo-greg-lemond",
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
        id: 227,
        target_page: OWNER_PATH,
        prompt: "who is Greg LeMond and what happened in his 1989 Tour de France comeback",
      }),
    );
  });
});
