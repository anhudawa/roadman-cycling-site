import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/cycling-training-camp-nutrition-guide.mdx";

describe("cycling training camp nutrition search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes a reviewed daily fuel-plan owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Cycling Training Camp Nutrition: Daily Fuel Plan",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("cited sports-nutrition");
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
  });

  it("separates nutrition, preparation, week-plan and booking intent", () => {
    expect(parsed.content).toContain(
      "This page owns **cycling training camp nutrition, fuelling practice and hydration decisions across successive ride days**",
    );
    for (const target of [
      "/blog/cycling-training-camp-preparation-guide",
      "/blog/cycling-training-camps-what-to-expect-guide",
      "/blog/what-to-expect-cycling-training-camp",
      "/training-camps",
      "/coaching",
      "/tools/fuelling",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.content).toContain(
      "not in this evergreen guide",
    );
  });

  it("grounds carbohydrate, recovery, gut, hydration and alcohol statements", () => {
    for (const target of [
      "https://pubmed.ncbi.nlm.nih.gov/26891166/",
      "https://pubmed.ncbi.nlm.nih.gov/25970669/",
      "https://pubmed.ncbi.nlm.nih.gov/33973552/",
      "https://pubmed.ncbi.nlm.nih.gov/37061651/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC9811094/",
      "https://pubmed.ncbi.nlm.nih.gov/39631226/",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(7);
    expect(
      parsed.data.claims.every(
        (claim: { evidenceLevel: string; source: string }) =>
          claim.evidenceLevel === "strong" && claim.source.length > 20,
      ),
    ).toBe(true);
    expect(parsed.content).toContain("1.2g carbohydrate per kg per hour");
    expect(parsed.content).toContain("body-mass gain from overdrinking");
  });

  it("removes universal calorie, timing, fluid and gut-training prescriptions", () => {
    for (const staleClaim of [
      "total daily energy expenditure can reach 5,500-7,000 kcal",
      "Under-eating by even 1,000 kcal per day accumulates to a 5,000 kcal deficit",
      "the single most important nutritional habit on a training camp",
      "sweat rate by 30-50 per cent compared to UK training conditions",
      "increasing by 10-15 g per hour each week",
      "contain 2-3 g/kg carbohydrate",
      "Breakfast: 2-3 Hours Before the Ride",
      "the enzymatic window has narrowed",
      "the rate of glycogen resynthesis has dropped significantly",
      "Alcohol impairs glycogen resynthesis",
      "three glasses every night will leave you measurably slower by day four",
      "500-750 ml per hour as a baseline",
      "Aim to replace 150 per cent of fluid lost",
      "0.5-1 kg per day — is a clear indicator",
      "A cycling training camp is the best thing you can do for your fitness all year",
      "Everything else takes care of itself",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(parsed.content).toContain(
      "There is no defensible rule that a 75kg camp rider always expends 5,500–7,000 calories",
    );
    expect(parsed.content).toContain(
      "Minute 31 is not nutritional failure",
    );
  });

  it("records the GSC decision and AI measurement prompt", () => {
    const decision = read(
      "docs/seo/gsc-training-camp-nutrition-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "413 impressions",
      "3 clicks",
      "0.7% CTR",
      "average position 9.6",
      "campamento",
      "resistance-training",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 215,
          target_page: "/blog/cycling-training-camp-nutrition-guide",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"cycling-training-camp-nutrition-guide"',
    );
  });
});
