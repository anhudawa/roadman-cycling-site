import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-energy-gels-guide";

describe("cycling gels search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a direct, current and bounded selection answer", () => {
    expect(data.seoTitle).toBe(
      "Best Cycling Gels 2026? How to Choose and Use Them",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("sports-nutrition");
    expect(data.answerCapsule.split(/\s+/)).toHaveLength(94);
    expect(data.citedClaims).toHaveLength(5);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(content).toContain("Roadman has **not** bought every current gel");
    expect(data.roadmanView.join(" ")).toContain("The packet is not the plan");
  });

  it("grounds dose, format, gut and caffeine boundaries in published evidence", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/21660838/",
      "https://pubmed.ncbi.nlm.nih.gov/23846824/",
      "https://pubmed.ncbi.nlm.nih.gov/37449467/",
      "https://pubmed.ncbi.nlm.nih.gov/35951130/",
      "https://pubmed.ncbi.nlm.nih.gov/42322010/",
      "https://pubmed.ncbi.nlm.nih.gov/35231883/",
      "https://pubmed.ncbi.nlm.nih.gov/35446596/",
      "https://pubmed.ncbi.nlm.nih.gov/33388079/",
      "https://pubmed.ncbi.nlm.nih.gov/37061651/",
      "https://pubmed.ncbi.nlm.nih.gov/42039889/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain("make 120 g/h plausible for selected prepared athletes");
    expect(content).toContain("drink, gel, chew and mixed formats");
    expect(content).toContain("Follow the directions for the exact gel");
  });

  it("removes unsupported universal packet, ratio, water and caffeine rules", () => {
    for (const staleClaim of [
      "gold standard is a 2:1",
      "Take your first gel 20-30 minutes",
      "one every 45 minutes",
      "prevents bonking, keeps your gut happy",
      "you do for any effort over 90 minutes",
      "Always chase a gel with water",
      "save caffeinated gels for the final third",
      "Using caffeine too early wastes",
      "upregulating the transporters",
      "pros can smash 120g",
      "5-10 exposures",
      "6-8 weeks",
      "200-300mg of sodium",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("corrects the nutrition hub and extends AI plus recrawl discovery", () => {
    const hub = read("content/topics/cycling-nutrition.mdx");
    expect(hub).toContain("30–60 g of carbohydrate per hour is a common starting range");
    expect(hub).toContain("Higher intakes are an advanced, event-specific option");
    expect(hub).toContain("Neither a 2:1 nor 1:0.8 ratio guarantees tolerance");
    expect(hub).not.toContain("Glucose alone tops out around 60g/hour");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("scripts/submit-indexnow.ts")).toContain(`/${OWNER}`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 240,
        prompt:
          "what are the best cycling energy gels in 2026 and how many should I use per hour",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });

  it("records the GSC baseline and protects the measurement cohort", () => {
    const decision = read(
      "docs/seo/gsc-cycling-gels-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "304 clicks",
      "48,989 impressions",
      "average position 7.9",
      "783 exposed query rows",
      "4 clicks",
      "2,511 impressions",
      "0.2% CTR",
      "average position 11.0",
      "2,510",
      "1,174",
      "1,071",
      "1,039",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
