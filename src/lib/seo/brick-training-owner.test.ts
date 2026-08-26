import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "brick-workouts-for-ironman";
const COMPANION = "brick-workouts-cyclists-guide";

describe("brick training search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a direct, current and bounded brick-training answer", () => {
    expect(data.seoTitle).toBe(
      "Brick Training for Triathlon: Evidence, Sessions & Plan",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("cycle-to-run");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT1H10M");
    expect(content).toContain("A useful brick has one primary job");
    expect(content).toContain("Five brick workouts, each with one job");
  });

  it("grounds transition, cadence and fuelling boundaries in published evidence", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/35871903/",
      "https://pubmed.ncbi.nlm.nih.gov/11049151/",
      "https://pubmed.ncbi.nlm.nih.gov/31100906/",
      "https://pubmed.ncbi.nlm.nih.gov/24453539/",
      "https://pubmed.ncbi.nlm.nih.gov/15849289/",
      "https://pubmed.ncbi.nlm.nih.gov/21660838/",
      "https://pubmed.ncbi.nlm.nih.gov/23846824/",
      "https://pubmed.ncbi.nlm.nih.gov/37449467/",
      "https://pubmed.ncbi.nlm.nih.gov/37061651/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain(
      "conflicting biomechanical and physiological results",
    );
    expect(content).toContain("Different tasks produced different answers");
    expect(content).toContain(
      "We found no comparative evidence supporting that claim",
    );
  });

  it("removes unsupported frequency, prediction, cadence and fuelling rules", () => {
    for (const staleClaim of [
      "One to two bricks per week is the working dose",
      "This is the single most predictive session you'll do",
      "Can I skip bricks if I already run well off the bike?\n    answer: >-\n      No.",
      "Rehearse exact race nutrition (90g carbs/hour)",
      "180+ steps per minute total",
      "where most Ironman races are won or lost",
      "produces a stress injury by week 12",
      "the neuromuscular transition specific to triathlon",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("keeps the cyclist companion and glossary distinct and corrected", () => {
    const companionRaw = read(`content/blog/${COMPANION}.mdx`);
    const companion = matter(companionRaw);
    expect(companion.data.seoTitle).toBe(
      "Bike-to-Run Brick Workouts for Cyclists & Duathletes",
    );
    expect(companion.data.lastReviewed).toBe("2026-08-26");
    expect(companionRaw).toContain(
      "[complete brick-training guide](/blog/brick-workouts-for-ironman)",
    );
    expect(companionRaw).not.toContain(
      "untrained bike-to-run transitions cost 10 to 15 percent",
    );
    expect(companionRaw).not.toContain("One or two bricks a week, maximum");

    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain(
      "A brick does not have one required duration, intensity, or weekly frequency",
    );
    expect(glossary).not.toContain(
      "The term 'brick' comes from the heavy-legged feeling",
    );
  });

  it("extends LLM, AI benchmark and recrawl discovery", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      "/blog/brick-workouts-for-ironman — Canonical brick-training guide",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 285,
        prompt:
          "what is brick training and how should a cyclist structure a bike to run workout",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });

  it("records the GSC baseline and protects the measurement cohort", () => {
    const decision = read(
      "docs/seo/gsc-brick-training-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "303 clicks",
      "35.9K impressions",
      "232 exposed query rows",
      "8 clicks",
      "1,549 impressions",
      "1,458",
      "105",
      "0 clicks",
      "769 impressions",
      "713",
      "2,068",
      "1,218",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
