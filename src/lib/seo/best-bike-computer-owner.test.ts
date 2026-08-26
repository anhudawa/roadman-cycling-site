import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "best-cycling-computers-2026";
const COMPARATOR = "wahoo-vs-garmin-cycling-computers";

describe("best bike computer 2026 search ownership", () => {
  it("makes the established owner current, direct and source-bounded", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe(
      "Best Bike Computer 2026: 9 Current Models Compared",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("editorial fact-checking");
    expect(data.keywords).toContain("best bike computer 2026");
    expect(data.citedClaims).toHaveLength(4);
    expect(data.faq).toHaveLength(5);

    for (const currentModel of [
      "Garmin Edge 1050",
      "Garmin Edge 850",
      "Garmin Edge 550",
      "Garmin Edge Explore 2",
      "Wahoo ELEMNT ACE",
      "Wahoo ELEMNT ROAM 3",
      "Wahoo ELEMNT BOLT 3",
      "Hammerhead Karoo",
      "COROS DURA",
    ]) {
      expect(raw).toContain(currentModel);
    }

    expect(content).toContain("The short answer");
    expect(content).toContain("Nine current bike computers compared");
    expect(content).toContain("67 hours with maps, navigation and three accessories");
    expect(content).toContain("49 hours in the same use case with dual-frequency GPS");
    expect(content).toContain("has not tested all nine devices under one controlled laboratory protocol");
    expect(content).toContain("https://support.coros.com/hc/en-us/articles/27280382578196-DURA-Battery-Specifications");
    expect(content).toContain("https://www.garmin.com/en-IE/p/802162/pn/010-02703-10/");

    for (const staleClaim of [
      "solar model is Edge 1050 Solar",
      "Hammerhead's Karoo 3 for deep analytics",
      "Garmin's Edge 540 for all-round balance",
      "Wahoo ELEMNT ROAM 3 is the battery leader",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("keeps brand-comparison and topic intents distinct", () => {
    const comparator = matter(
      read(`content/blog/${COMPARATOR}.mdx`),
    );
    expect(comparator.data.keywords).not.toContain("best cycling computer 2026");
    expect(comparator.data.keywords).toContain("wahoo vs garmin");
    expect(comparator.content).toContain(`/blog/${OWNER}`);

    const topic = read("content/topics/cycling-tech.mdx");
    expect(topic).toContain("COROS DURA targets ultra-endurance battery life");
    expect(topic).toContain("Best Bike Computers 2026");
    expect(topic).not.toContain("Garmin's Edge 540 for all-round balance");
    expect(topic).not.toContain("Hammerhead's Karoo 3");
  });

  it("records the GSC baseline and extends AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-best-bike-computer-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("77 clicks");
    expect(decision).toContain("1,876 impressions");
    expect(decision).toContain("4.1% CTR");
    expect(decision).toContain("Average position 6.9");
    expect(decision).toContain("earliest reliable review\n  **5 September 2026**");
    expect(decision).toContain("earliest reliable review\n  **26 September 2026**");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      `/blog/${OWNER}`,
      `/blog/${COMPARATOR}`,
      "/topics/cycling-tech",
    ]) {
      expect(indexNow).toContain(path);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 237,
        prompt:
          "what is the best bike computer in 2026 for training navigation and long rides",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });
});
