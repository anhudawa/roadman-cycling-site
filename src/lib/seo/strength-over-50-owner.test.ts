import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "strength-training-cyclists-over-50";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const article = matter(read(`content/blog/${SLUG}.mdx`));
const trustedCopy = `${JSON.stringify(article.data)} ${article.content}`;

describe("strength training for cyclists over 50 owner", () => {
  it("preserves the search owner while publishing a current direct answer", () => {
    expect(article.data.seoTitle).toBe(
      "Strength Training for Cyclists Over 50: Lifts & Schedule",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.reviewedBy).toContain("older-adult reviews");
    expect(article.data.evidenceLevel).toBe("emerging");
    expect(article.data.citedClaims).toHaveLength(5);
    expect(article.data.keyTakeaways).toHaveLength(6);
    expect(article.data.faq).toHaveLength(7);
    expect(article.data.answerCapsule).toContain("not a cycling-proven optimum");
  });

  it("separates cyclist performance from over-50 concurrent-training evidence", () => {
    for (const pmid of [
      "40632222",
      "36222981",
      "35728627",
      "39405023",
      "26420238",
      "23256921",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(trustedCopy).toContain("did **not** report the “over-50 subset”");
    expect(trustedCopy).toContain("low certainty");
    expect(trustedCopy).toContain("not proof of the optimal cycling-performance frequency");
  });

  it("removes fixed prescriptions and unsupported guarantees", () => {
    for (const unsupported of [
      "two sessions per week beats five",
      "the science on this is no longer ambiguous",
      "only intervention proven",
      "same posterior-chain, single-leg and force-production stimulus",
      "with much lower injury exposure",
      "power-to-weight typically improves",
      "one session per week maintains adaptations",
      "24-hour gap",
      "48-72 hours between",
      "wednesday and friday work",
      "the improvement was not modest",
      "reduces fracture risk",
      "almost always lose ground",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("provides an adaptable plan and a conservative recovery decision", () => {
    expect(article.content).toContain("### Phase 1: learn and tolerate");
    expect(article.content).toContain("### Example session A");
    expect(article.content).toContain("### Example session B");
    expect(article.content).toContain("**Separate demanding sessions.**");
    expect(article.content).toContain("**Consolidate stress.**");
    expect(article.content).toContain("not an injury screen or recovery guarantee");
  });

  it("routes masters strength intent into tools and one app list", () => {
    for (const pathname of [
      "/tools/strength-session-planner",
      "/tools/training-readiness",
      "/tools/recovery-screen",
      "/downloads/strength-training-for-cyclists-over-50-plan.pdf",
      "/app?source=strength-over-50-guide",
    ]) {
      expect(article.content).toContain(`](${pathname})`);
    }
  });

  it("serves the printable plan requested in Search", () => {
    const pdfPath = path.join(
      ROOT,
      "public/downloads/strength-training-for-cyclists-over-50-plan.pdf",
    );
    expect(fs.existsSync(pdfPath)).toBe(true);
    expect(fs.statSync(pdfPath).size).toBeGreaterThan(10_000);
    expect(read(`content/blog/${SLUG}.mdx`)).toContain(
      "Download the free printable 10-week strength plan PDF",
    );
  });

  it("records the GSC and Google AI baseline", () => {
    const brief = read(
      "docs/seo/gsc-strength-over-50-app-opportunity-2026-08-31.md",
    );
    for (const signal of [
      "215 clicks",
      "5,477 impressions",
      "3.9% CTR",
      "average position 11.9",
      "1,655 impressions",
      "strength training for cyclists over 50 pdf",
    ]) {
      expect(brief).toContain(signal);
    }
  });

  it("keeps the owner in discovery and adds the app-era AI prompt", () => {
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${SLUG}`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 348,
        prompt:
          "what strength training should a cyclist over 50 do and how should it fit around bike sessions",
        target_page: `/blog/${SLUG}`,
      }),
    );
  });
});
