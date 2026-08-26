import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-stretching-routine";

describe("cycling stretching owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a direct, current and extractable routine answer", () => {
    expect(data.seoTitle).toBe(
      "Stretching for Cyclists: Evidence-Based 10-Minute Routine",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("cycling-biomechanics");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(60);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT10M");
    expect(content).toContain("increasing range of motion when more range is actually needed");
    expect(content).toContain("The 10-minute stretching routine for cyclists");
  });

  it("grounds flexibility, timing, recovery, injury and pain boundaries", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/39614059/",
      "https://pubmed.ncbi.nlm.nih.gov/21659901/",
      "https://pubmed.ncbi.nlm.nih.gov/26642915/",
      "https://pubmed.ncbi.nlm.nih.gov/34025459/",
      "https://pubmed.ncbi.nlm.nih.gov/36622555/",
      "https://pubmed.ncbi.nlm.nih.gov/38943165/",
      "https://pubmed.ncbi.nlm.nih.gov/27784817/",
      "https://pubmed.ncbi.nlm.nih.gov/41705012/",
      "https://www.nice.org.uk/guidance/ng127/chapter/Recommendations-for-adults-aged-over-16",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain("More pain is therefore not a better dose");
    expect(content).toContain("post-exercise stretching did not improve strength recovery");
    expect(content).toContain("Not on its own");
    expect(content).toContain("A stretch may belong in the plan; it is not the diagnosis");
  });

  it("removes unsupported universal stretching and pain claims", () => {
    for (const staleClaim of [
      "position becomes permanent",
      "reverse most of these issues",
      "tightness actually limits your performance",
      "single most important stretch for cyclists",
      "most common source of lower back pain in cyclists",
      "improves breathing capacity",
      "variable that produces results",
      "upper cross syndrome",
      "lower cross syndrome",
      "15-20 minutes, three to four times weekly—minimum",
      "Fifteen minutes four times a week. That is the dose.",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("extends bounded LLM, AI benchmark and recrawl discovery", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("scripts/submit-indexnow.ts")).toContain(`/${OWNER}`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 242,
        prompt:
          "what stretching routine should cyclists do before or after riding",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });

  it("records the GSC baseline and measurement dates", () => {
    const decision = read(
      "docs/seo/gsc-cycling-stretching-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "121 clicks",
      "8,596 impressions",
      "1.4% CTR",
      "average position 7.5",
      "243 exposed query rows",
      "5 clicks",
      "1,758 impressions",
      "average position 6.0",
      "1,762",
      "427",
      "| 5.0 |",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
