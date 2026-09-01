import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-recovering-from-overtraining-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("overtraining syndrome recovery owner", () => {
  it("keeps one reviewed recovery and return-to-cycling owner", () => {
    expect(article.data.seoTitle).toBe(
      "Overtraining Syndrome Recovery: Return to Cycling Safely",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(7);
    expect(article.data.faq).toHaveLength(9);

    for (const heading of [
      "First: are you diagnosed, being assessed or simply exhausted?",
      "What the evidence can—and cannot—tell you about recovery",
      "A criterion-based recovery roadmap",
      "Progress, hold or regress: the decision table",
      "Blood tests: investigate causes, not a recovery score",
      "HRV and wearables cannot clear the return",
      "Psychological recovery is part of recovery",
      "Preventing a second collapse",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("cites diagnosis, energy, psychology, sleep and return evidence", () => {
    for (const pmid of [
      "23247672",
      "35320774",
      "34496702",
      "35819582",
      "41580212",
      "27226389",
      "33144349",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported timelines, tests, treatment and return rules", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();

    for (const unsupported of [
      "8-16 weeks for mild",
      "eight to sixteen weeks for mild",
      "minimum of two to four weeks",
      "after two to four weeks of complete rest",
      "each stage should last a minimum",
      "repeat the panel every four to six weeks",
      "panel you want, repeated every four to six weeks",
      "anything below 30 ng/ml",
      "cortisol-to-testosterone ratio is a more useful marker",
      "hrv is the most accessible daily indicator",
      "absolute value trending upward",
      "if your hrv is still flat and suppressed",
      "protein at 1.6 to 2.0 grams",
      "eat at maintenance or slightly above",
      "target eight to nine hours in bed",
      "melatonin or short-term sleep support",
      "weekly tss at roughly 30 to 40 per cent",
      "build back to your previous training volume",
      "2:1 or 3:1 build-to-recovery ratio",
      "7-day rolling average drops below baseline",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("keeps comparison, symptom and persistent-fatigue intents separate", () => {
    for (const slug of [
      "overtraining-vs-overreaching-cyclists",
      "cycling-fatigue-signs-when-to-back-off",
      "cycling-chronic-fatigue-when-tiredness-persists-guide",
    ]) {
      expect(article.data.relatedPosts).toContain(slug);
      expect(fs.existsSync(path.join(ROOT, `content/blog/${slug}.mdx`))).toBe(
        true,
      );
    }

    expect(article.content).toContain(
      "This page is for managing the return when the problem has become prolonged enough to need assessment.",
    );
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain(
      "](/app?source=overtraining-recovery-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"overtraining-recovery-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-overtraining-recovery-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "27 clicks",
      "1,453 web impressions",
      "1.9% CTR",
      "9.5 average position",
      "694 Google AI-feature impressions",
      "Prompt **373**",
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
      expect.objectContaining({ id: 373, target_page: `/blog/${OWNER}` }),
    );
  });
});
