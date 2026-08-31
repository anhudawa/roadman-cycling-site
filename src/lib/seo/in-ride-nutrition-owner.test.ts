import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-in-ride-nutrition-guide";

describe("in-ride cycling nutrition owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a direct, current and extractable guideline answer", () => {
    expect(data.seoTitle).toBe(
      "Cycling Nutrition Guidelines: What to Eat During a Ride",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-31");
    expect(data.lastReviewed).toBe("2026-08-31");
    expect(data.reviewedBy).toContain("exercise-hyponatraemia");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(60);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(7);
    expect(data.howTo.steps).toHaveLength(6);
    expect(content).toContain("three separate numbers: **carbohydrate, fluid and sodium**");
    expect(content).toContain("This is a planning framework, not a diagnosis");
  });

  it("grounds carbohydrate, hydration, sodium and gut boundaries", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/37449467/",
      "https://pubmed.ncbi.nlm.nih.gov/21660838/",
      "https://pubmed.ncbi.nlm.nih.gov/23846824/",
      "https://pubmed.ncbi.nlm.nih.gov/35951130/",
      "https://pubmed.ncbi.nlm.nih.gov/42322010/",
      "https://pubmed.ncbi.nlm.nih.gov/35231883/",
      "https://pubmed.ncbi.nlm.nih.gov/28985128/",
      "https://pubmed.ncbi.nlm.nih.gov/33526364/",
      "https://pubmed.ncbi.nlm.nih.gov/26102445/",
      "https://pubmed.ncbi.nlm.nih.gov/37061651/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain("120 g/h only when the event demand justifies it");
    expect(content).toContain("There is no evidence-based reason to assign every cyclist 500–750 ml/h");
    expect(content).toContain("Sodium cannot make forced overdrinking safe");
    expect(content).toContain("sweat rate (L/h) = sweat loss ÷ ride hours");
  });

  it("answers the demonstrated 90 g/h brand-and-product planning intent", () => {
    expect(content).toContain(
      "## 90 g carbohydrates per hour: gel-and-drink buying plans",
    );
    expect(content).toContain("40 + 25 + 25 = **90 g**");
    expect(content).toContain("30 + 30 + 30 = **90 g**");
    expect(content).toContain("https://www.maurten.com/education/how-to-fuel");
    expect(content).toContain(
      "https://www.precisionhydration.com/products/pf-30-gel/",
    );
    expect(content).toContain("Formulations, serving sizes and availability can change");
    expect(content).toContain("not product rankings or medical prescriptions");
  });

  it("removes unsupported universal intake and timing prescriptions", () => {
    for (const staleClaim of [
      "Start fuelling at 60 minutes",
      "80-120g per hour on rides over 90 minutes",
      "without stomach distress",
      "the first 30g/hr you skip",
      "add 10g per hour each week",
      "By week 8, most cyclists",
      "500-750ml per hour",
      "500-700mg per hour",
      "start fuelling within the first 20 minutes",
      "single biggest performance improvement",
      "if it's good enough for a Grand Tour stage winner",
      "flat white (150 cal)",
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
        id: 241,
        prompt:
          "cycling nutrition during a long ride how much carbohydrate fluid and sodium per hour",
        target_page: `/blog/${OWNER}`,
      }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 347,
        prompt:
          "cycling fueling plan with brands for 90g carbs per hour using gels and drink what should I buy",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });

  it("records the Google generative-AI and product-intent baseline", () => {
    const decision = read(
      "docs/seo/gsc-fuelling-ai-opportunity-2026-08-31.md",
    );
    for (const signal of [
      "5,399",
      "188",
      "839 impressions",
      "0.6% CTR",
      "average position of 14.6",
      "63 impressions",
    ]) {
      expect(decision).toContain(signal);
    }
  });

  it("records the GSC baseline and measurement dates", () => {
    const decision = read(
      "docs/seo/gsc-in-ride-nutrition-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "184 clicks",
      "22,786 impressions",
      "0.8% CTR",
      "average position 7.9",
      "297 exposed query rows",
      "3 clicks",
      "1,477 impressions",
      "average position 7.0",
      "1,470",
      "1,563",
      "zero clicks",
      "position 5.4",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
