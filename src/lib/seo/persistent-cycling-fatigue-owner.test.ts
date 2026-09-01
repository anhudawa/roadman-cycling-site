import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-chronic-fatigue-when-tiredness-persists-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("persistent cycling fatigue search owner", () => {
  it("keeps one reviewed persistent-fatigue owner with direct decisions", () => {
    expect(article.data.seoTitle).toBe(
      "Persistent Cycling Fatigue: Causes, Tests and Safe Return",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "Persistent fatigue is a symptom, not a diagnosis",
      "When should a cyclist get medical assessment?",
      "Red flags: stop riding and seek urgent help",
      "What should the clinical assessment cover?",
      "Which blood tests should a fatigued cyclist request?",
      "Iron: important, but not one internet threshold",
      "Post-viral fatigue, PEM and ME/CFS are not interchangeable",
      "If exertion causes delayed worsening, do not use a normal progression",
      "A cause-specific return to cycling",
      "What a recovery app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("cites official clinical guidance and the athlete differential evidence", () => {
    for (const official of [
      "https://www.nhs.uk/symptoms/tiredness-and-fatigue/",
      "https://www.nice.org.uk/guidance/ng206/chapter/recommendations",
      "https://www.cdc.gov/me-cfs/hcp/clinical-care/",
    ]) {
      expect(article.content).toContain(official);
    }

    for (const pmid of [
      "16547143",
      "17062653",
      "35100494",
      "37752011",
      "23247672",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported diagnosis, test, treatment and timeline claims", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();

    for (const unsupported of [
      "beyond 3-4 weeks",
      "likely not training-related. it is medical",
      "ferritin above 50",
      "ideally above 80",
      "vo2max drops of 7-10",
      "if your ferritin comes back below 30",
      "standard approach is oral iron",
      "weeks 1-4",
      "weeks 5-8",
      "weeks 9-16",
      "beyond 16 weeks",
      "60-70% of your pre-fatigue volume",
      "10-15% per week",
      "post-viral fatigue: 3-18 months",
      "chronic fatigue syndrome: 12-24 months",
      "almost certainly medical",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("preserves symptom, comparison and OTS recovery owner boundaries", () => {
    for (const slug of [
      "cycling-fatigue-signs-when-to-back-off",
      "overtraining-vs-overreaching-cyclists",
      "cycling-recovering-from-overtraining-guide",
    ]) {
      expect(article.data.relatedPosts).toContain(slug);
      expect(fs.existsSync(path.join(ROOT, `content/blog/${slug}.mdx`))).toBe(
        true,
      );
    }
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain(
      "](/app?source=persistent-fatigue-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"persistent-fatigue-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-persistent-cycling-fatigue-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "15 clicks",
      "741 web impressions",
      "2.0% CTR",
      "6.8 average position",
      "301 Google AI-feature impressions",
      "Prompt **374**",
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
      expect.objectContaining({ id: 374, target_page: `/blog/${OWNER}` }),
    );
  });
});
