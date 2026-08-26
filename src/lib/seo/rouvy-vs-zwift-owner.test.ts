import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAllComparisonSlugs } from "@/lib/comparisons";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "rouvy-vs-zwift";
const RETIRED = "rouvy-vs-zwift-platform";

describe("ROUVY vs Zwift search ownership", () => {
  it("makes the established owner current, direct and source-bounded", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe(
      "ROUVY vs Zwift 2026: Which Indoor App Is Better?",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("editorial fact-checking");
    expect(data.keywords).toContain("rouvy vs zwift");
    expect(data.citedClaims).toHaveLength(4);
    expect(data.faq).toHaveLength(6);

    expect(content).toContain("The 30-second decision");
    expect(content).toContain("Zwift acquired ROUVY in April 2026");
    expect(content).toContain("separate apps with separate subscriptions");
    expect(content).toContain("has not run a controlled platform-versus-platform training-outcome study");
    expect(content).toContain("https://support.zwift.com/en_us/zwift-and-rouvy-faq-ByG7Av0be");
    expect(content).toContain("https://support.rouvy.com/hc/en-us/articles/46200881577489-ROUVY-has-been-acquired-by-Zwift");
    expect(content).toContain("https://rouvy.com/en/pricing");
  });

  it("permanently retires the stale generated duplicate", () => {
    const config = read("next.config.ts");
    const source = `source: "/compare/${RETIRED}"`;
    const index = config.indexOf(source);

    expect(index).toBeGreaterThan(-1);
    expect(config.slice(index, index + 240)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(config.slice(index, index + 240)).toContain("permanent: true");
    expect(getAllComparisonSlugs()).not.toContain(RETIRED);
    expect(read("src/lib/comparisons.ts")).not.toContain(`slug: "${RETIRED}"`);
    expect(read("src/lib/tools/landing-content.ts")).toContain(
      `href: "/blog/${OWNER}"`,
    );
    expect(read("scripts/build-cluster-buckets.mjs")).not.toContain(RETIRED);
  });

  it("records the GSC baseline and extends AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-rouvy-vs-zwift-consolidation-2026-08-26.md",
    );
    expect(decision).toContain("644 clicks");
    expect(decision).toContain("12,266 impressions");
    expect(decision).toContain("5.3% CTR");
    expect(decision).toContain("Average position 4.0");
    expect(decision).toContain("12,179");
    expect(decision).toContain("3.8");
    expect(decision).toContain("252");
    expect(decision).toContain("22.0");
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
        id: 238,
        prompt:
          "ROUVY vs Zwift in 2026 which indoor cycling app is better after the acquisition",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });
});
