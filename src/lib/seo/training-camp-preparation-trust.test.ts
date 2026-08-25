import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/cycling-training-camp-preparation-guide.mdx";

describe("cycling training camp preparation search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes a reviewed four-week preparation owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Cycling Training Camp Preparation: 4-Week Plan",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("cited IOC");
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

  it("separates preparation, expectations, adaptation and booking intent", () => {
    expect(parsed.content).toContain(
      "This page owns **cycling training camp preparation in the four weeks before departure**",
    );
    for (const target of [
      "/blog/what-to-expect-cycling-training-camp",
      "/blog/cycling-training-camps-what-to-expect-guide",
      "/training-camps",
      "/coaching",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.content).toContain(
      "not this editorial guide—as the source of truth",
    );
  });

  it("grounds load, taper, nutrition, heat and sleep guidance", () => {
    for (const target of [
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC5013087/",
      "https://pubmed.ncbi.nlm.nih.gov/37163550/",
      "https://pubmed.ncbi.nlm.nih.gov/26891166/",
      "https://pubmed.ncbi.nlm.nih.gov/25970669/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC9811094/",
      "https://pubmed.ncbi.nlm.nih.gov/33144349/",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(6);
    expect(
      parsed.data.claims.every(
        (claim: { evidenceLevel: string; source: string }) =>
          claim.evidenceLevel === "strong" && claim.source.length > 20,
      ),
    ).toBe(true);
  });

  it("removes unsupported guarantees and fixed thresholds", () => {
    for (const staleClaim of [
      "Day 1 pacing is the single biggest predictor",
      "exceeding planned TSS by 10-15% on day one leads to cracking by day 4",
      "A training camp can add 20-40 CTL points in a single week",
      "equivalent of 4-6 weeks of normal structured training",
      "power output at the same RPE drops by 8-15%",
      "A spike of 8-10 bpm above baseline",
      "The 7-10 day post-camp absorption period is where the fitness actually builds",
      "The fitness gains from camp appear on the other side of this valley",
      "your heart rate will be 5-8 bpm higher than normal",
      "Arrive fresh, glycogen-loaded",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(parsed.content).toContain(
      "There is no evidence-based rule that every rider should add 10–15% per week",
    );
    expect(parsed.content).toContain(
      "That does **not** prove that every recreational cyclist should cut exactly 41–60%",
    );
  });

  it("records the GSC decision and AI measurement prompt", () => {
    const decision = read(
      "docs/seo/gsc-training-camp-preparation-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "771 impressions",
      "2 clicks",
      "0.3% CTR",
      "average position 7.9",
      "309",
      "26.9",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 213,
          target_page: "/blog/cycling-training-camp-preparation-guide",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"cycling-training-camp-preparation-guide"',
    );
  });
});
