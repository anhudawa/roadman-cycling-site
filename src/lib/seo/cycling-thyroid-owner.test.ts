import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-thyroid-function-performance-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling thyroid search owner", () => {
  it("keeps the existing URL as a reviewed thyroid owner", () => {
    expect(article.data.seoTitle).toBe(
      "Cycling and Thyroid Function: Tests, Fatigue and Training",
    );
    expect(article.data.updatedDate).toBe("2026-09-01");
    expect(article.data.lastReviewed).toBe("2026-09-01");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "Is cycling good for thyroid health?",
      "Can too much cycling cause thyroid problems?",
      "Thyroid basics: what TSH, T4 and T3 mean",
      "What are the symptoms of an underactive thyroid?",
      "Which thyroid tests should a cyclist get?",
      "Is there an optimal TSH, T3 or T4 for cyclists?",
      "Low T3, low energy availability and REDs",
      "Can thyroid disease look like overtraining syndrome?",
      "Cycling while taking levothyroxine",
      "How should training change during assessment or treatment?",
      "When should a rider seek medical assessment?",
      "What the Roadman app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("uses the clinical pathway and authoritative thyroid guidance", () => {
    for (const source of [
      "https://www.nice.org.uk/guidance/ng145/chapter/Recommendations",
      "https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/",
      "https://www.nhs.uk/medicines/levothyroxine/",
      "https://www.thyroid.org/thyroid-function-tests/",
    ]) {
      expect(article.content).toContain(source);
    }

    for (const pmid of [
      "37999992",
      "32028353",
      "8498602",
      "37752011",
      "34496702",
      "28785411",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("routes overlapping fatigue and endocrine intents to their owners", () => {
    for (const slug of [
      "energy-availability-red-s-cyclists-guide",
      "iron-deficiency-cyclists-masters",
      "cycling-chronic-fatigue-when-tiredness-persists-guide",
      "blood-testing-cyclists-what-to-check-guide",
    ]) {
      expect(`${JSON.stringify(article.data)} ${article.content}`).toContain(slug);
    }
  });

  it("removes athlete ranges, universal panels and diagnostic overclaims", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();
    for (const unsupported of [
      "endurance athletes need free t3, free t4, and thyroid antibodies",
      "free t4 should sit in the upper half of the reference range, and free t3 in the upper third",
      "free t4 should sit in the upper half",
      "the one that matters most",
      "your body has deliberately reduced",
      "a 2pm blood test can show a tsh reading 50% lower",
      "fasting, early-morning blood draws are essential",
      "full thyroid panel at least once per year",
      "retest every 6-8 weeks",
      "overtraining typically resolves in two to four weeks",
      "levothyroxine absorption is reduced by up to 80%",
      "always test fasting, first thing in the morning",
      "a complete thyroid assessment for an endurance athlete should include",
      "reverse t3 (rt3) is an inactive metabolite",
      "if your doctor only tested tsh, you have one data point from a five-variable equation",
      "a tsh of 3.5 in a sedentary office worker is different",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("routes app interest into the single attributed audience", () => {
    expect(article.content).toContain("](/app?source=thyroid-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"thyroid-guide"');
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records the baseline and extends discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-thyroid-owner-2026-09-01.md");
    for (const signal of [
      "20 clicks",
      "1,702 web impressions",
      "1.2% CTR",
      "8.3 average position",
      "399 Google AI-feature impressions",
      "Prompt **379**",
    ]) {
      expect(brief).toContain(signal);
    }

    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${OWNER}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 379, target_page: `/blog/${OWNER}` }),
    );
  });
});
