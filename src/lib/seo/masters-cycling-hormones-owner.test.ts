import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "masters-cycling-hormones-performance-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("masters cycling hormones search owner", () => {
  it("keeps the existing URL as a reviewed overview owner", () => {
    expect(article.data.seoTitle).toBe(
      "Hormones and Cycling After 40: Evidence-Based Guide",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(9);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "Do hormones explain slower recovery after 40?",
      "Testosterone: one question, not the whole panel",
      "Cortisol: a stress hormone, not a readiness grade",
      "Thyroid: common symptoms, specific clinical pathway",
      "Does cycling increase growth hormone?",
      "Perimenopause and menopause: symptoms vary",
      "Low energy availability can affect multiple systems",
      "Which hormone blood tests should a masters cyclist get?",
      "What should change in training?",
      "When should a rider seek medical assessment?",
      "What the Roadman app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("routes each endocrine intent to the specialist owner", () => {
    for (const slug of [
      "cycling-testosterone-and-training-over-40-guide",
      "cycling-cortisol-stress-performance-guide",
      "cycling-thyroid-function-performance-guide",
      "cycling-menopause-training-guide",
      "energy-availability-red-s-cyclists-guide",
      "blood-testing-cyclists-what-to-check-guide",
    ]) {
      expect(`${JSON.stringify(article.data)} ${article.content}`).toContain(slug);
    }
  });

  it("cites masters, endocrine, menopause, REDs and biomarker evidence", () => {
    for (const source of [
      "https://doi.org/10.1210/jc.2018-00229",
      "https://www.nice.org.uk/guidance/ng145",
      "https://www.endocrine.org/clinical-practice-guidelines/hormone-replacement-in-hypopituitarism",
      "https://www.nhs.uk/conditions/menopause-and-perimenopause/things-you-can-do/",
      "https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf",
    ]) {
      expect(article.content).toContain(source);
    }

    for (const pmid of [
      "35122228",
      "33922108",
      "30141022",
      "41229716",
      "39003439",
      "42154220",
      "37752011",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal panels, hormone hacks and diagnostic overclaims", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();
    for (const unsupported of [
      "testosterone declines at roughly 1-2% per year",
      "free testosterone — the fraction available to muscle tissue — matters more",
      "cortisol-to-testosterone ratio is a better marker",
      "annual blood work should check",
      "at minimum: complete blood count, ferritin, total testosterone",
      "high-intensity intervals raise testosterone and growth hormone",
      "zone 2 reduces chronic cortisol",
      "blood work later confirms through better gh-mediated markers",
      "subclinical hypothyroidism affects up to 10% of endurance athletes",
      "above 10-12% for men",
      "ashwagandha has modest evidence for cortisol reduction",
      "40g+ per meal",
      "8-12 nmol/l",
      "banned outright in many amateur racing categories",
      "growth hormone release is tightly linked to sleep quality",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain(
      "](/app?source=masters-hormones-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"masters-hormones-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records the baseline and extends discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-masters-cycling-hormones-owner-2026-08-31.md",
    );
    for (const signal of [
      "15 clicks",
      "1,227 web impressions",
      "1.2% CTR",
      "7.9 average position",
      "321 Google AI-feature impressions",
      "Prompt **378**",
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
      expect.objectContaining({ id: 378, target_page: `/blog/${OWNER}` }),
    );
  });
});
