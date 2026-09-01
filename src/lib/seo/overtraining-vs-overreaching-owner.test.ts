import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "overtraining-vs-overreaching-cyclists";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("overtraining vs overreaching comparison owner", () => {
  it("keeps a reviewed comparison owner with evidence and direct answers", () => {
    expect(article.data.seoTitle).toBe(
      "Overtraining vs Overreaching for Cyclists: Key Differences",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(7);
    expect(article.data.faq).toHaveLength(9);

    for (const heading of [
      "Overtraining vs overreaching: the comparison",
      "What actually distinguishes overreaching from overtraining?",
      "Can you tell which state you are in right now?",
      "Is functional overreaching good or necessary?",
      "Can HRV, resting heart rate or a blood test tell the difference?",
      "Low energy availability, REDs and overtraining can overlap",
      "How long does recovery take?",
      "Do masters cyclists have different diagnostic rules?",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("cites consensus, diagnostic, monitoring, energy and sleep evidence", () => {
    for (const pmid of [
      "23247672",
      "35320774",
      "34496702",
      "32064575",
      "34108275",
      "35819582",
      "38809828",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes the former diagnostic timelines and monitoring promises", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();

    for (const unsupported of [
      "functional overreaching recovers in days",
      "non-functional overreaching takes weeks",
      "true overtraining syndrome takes months",
      "recovery timeline after rest is the only reliable",
      "the response to rest is the diagnosis",
      "falling hrv trend that does not rebound",
      "chronically suppressed hrv",
      "persistently higher than your norm suggests your system is stuck",
      "one or two of these after a hard block is normal",
      "the cause is almost always missing recovery",
      "if you're reading this and functioning well enough",
      "days to bounce back means you were fine",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("preserves distinct symptom, recovery and persistent-fatigue owners", () => {
    for (const slug of [
      "cycling-fatigue-signs-when-to-back-off",
      "cycling-recovering-from-overtraining-guide",
      "cycling-chronic-fatigue-when-tiredness-persists-guide",
    ]) {
      expect(article.data.relatedPosts).toContain(slug);
      expect(fs.existsSync(path.join(ROOT, `content/blog/${slug}.mdx`))).toBe(
        true,
      );
    }

    expect(article.content).toContain(
      "This page owns the distinction between the categories.",
    );
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain(
      "](/app?source=overreaching-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"overreaching-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-overtraining-vs-overreaching-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "18 clicks",
      "1,485 web impressions",
      "1.2% CTR",
      "9.3 average position",
      "630 Google AI-feature impressions",
      "Prompt **372**",
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
      expect.objectContaining({ id: 372, target_page: `/blog/${OWNER}` }),
    );
  });
});
