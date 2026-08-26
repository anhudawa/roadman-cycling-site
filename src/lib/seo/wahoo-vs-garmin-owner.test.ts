import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAllComparisonSlugs } from "@/lib/comparisons";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "wahoo-vs-garmin-cycling-computers";
const RETIRED = "garmin-vs-wahoo";

describe("Wahoo vs Garmin search ownership", () => {
  it("makes the established owner current, direct and source-bounded", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe(
      "Wahoo vs Garmin Bike Computers 2026: Which Is Better?",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("editorial fact-checking");
    expect(data.keywords).toContain("wahoo vs garmin");
    expect(data.citedClaims).toHaveLength(4);
    expect(data.faq).toHaveLength(5);

    expect(content).toContain("The 30-second decision");
    expect(content).toContain("Garmin is the stronger navigation and training-ecosystem choice");
    expect(content).toContain("Wahoo is the stronger focused-workflow choice");
    expect(content).toContain("has not subjected all six current devices to one controlled side-by-side laboratory protocol");
    expect(content).toContain("https://www.garmin.com/en-US/compare/");
    expect(content).toContain("https://support.wahoofitness.com/");
  });

  it("permanently retires the stale generated duplicate", () => {
    const config = read("next.config.ts");
    const source = `source: "/compare/${RETIRED}"`;
    const index = config.indexOf(source);

    expect(index).toBeGreaterThan(-1);
    expect(config.slice(index, index + 280)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(config.slice(index, index + 280)).toContain("permanent: true");
    expect(getAllComparisonSlugs()).not.toContain(RETIRED);
    expect(read("src/lib/comparisons.ts")).not.toContain(`slug: "${RETIRED}"`);
    expect(read("src/lib/comparisons.ts")).toContain(
      `[Wahoo vs Garmin](/blog/${OWNER})`,
    );
    expect(read("scripts/build-cluster-buckets.mjs")).not.toContain(
      `"${RETIRED}"`,
    );
  });

  it("records both GSC baselines and extends AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-wahoo-vs-garmin-consolidation-2026-08-26.md",
    );
    for (const baseline of [
      "181 clicks",
      "2,912 impressions",
      "6.2% CTR",
      "Average position 4.1",
      "2,872",
      "6.3%",
      "28.5",
      "268 clicks",
      "2,087 impressions",
      "12.8% CTR",
      "Average position 2.3",
      "2,086",
      "2.2",
      "33.7",
    ]) {
      expect(decision).toContain(baseline);
    }
    expect(decision).toContain("earliest reliable review\n  **5 September 2026**");
    expect(decision).toContain("earliest reliable review\n  **26 September 2026**");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 239,
        prompt:
          "Wahoo vs Garmin bike computers in 2026 which brand is better for training and navigation",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });
});
