import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { LLMS_PINNED_BLOG_SLUGS } from "./llms-content";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const SLUG = "cycling-training-plan-build-friel-lorang-johnson";
const PAGE_PATH = `/blog/${SLUG}`;
const source = read(`content/blog/${SLUG}.mdx`);
const article = matter(source);

describe("named training-plan framework comparison trust", () => {
  it("owns named comparison intent with reviewed metadata", () => {
    expect(article.data.title).toBe(
      "Joe Friel vs Dan Lorang vs Dylan Johnson: Plan Methods",
    );
    expect(article.data.seoTitle).toBe(
      "Friel vs Lorang vs Dylan Johnson Training Plans",
    );
    expect(article.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(article.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(article.data.primaryHub).toBe("cycling-training-plans");
    expect(article.data.author).toBe("anthony-walsh");
    expect(article.data.reviewedBy).toContain("Roadman transcripts");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.keywords).toEqual([
      "joe friel training plan",
      "dan lorang training plan",
      "dylan johnson training plan",
      "lorang method cycling",
      "cycling periodisation comparison",
    ]);
  });

  it("separates frameworks, practitioner evidence and the elite N=1", () => {
    for (const phrase of [
      "## Source ledger",
      "## Comparison at a glance",
      "## Joe Friel: race-back periodisation",
      "## Dan Lorang: sustainable load in context",
      "### Correction: the unsupported 80% claim",
      "## Dylan Johnson: an elite 2025 self-experiment",
      "not the gold standard",
      "## What independent research can and cannot decide",
      "## What not to copy",
      "## Scope and safety",
    ]) {
      expect(article.content).toContain(phrase);
    }

    for (const sourceUrl of [
      "https://joefrieltraining.com/kiss-periodization/",
      "https://joefrieltraining.com/the-all-new-cyclists-training-bible/",
      "https://racing.trekbikes.com/stories/lidl-trek/a-new-chapter-begins-lidl-trek-announces-leadership-transition-following-the-2026-tour-de-france",
      "https://pubmed.ncbi.nlm.nih.gov/36640771/",
      "https://pubmed.ncbi.nlm.nih.gov/31802956/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
    ]) {
      expect(source).toContain(sourceUrl);
    }
    expect(article.content).not.toMatch(/^\|/gm);
  });

  it("removes the stale role and unsupported prescriptive article", () => {
    expect(article.data.experts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Dan Lorang",
          role: "Head of Performance at Lidl-Trek since August 2026",
        }),
      ]),
    );
    for (const staleClaim of [
      "Bora-Hansgrohe coach",
      "three valid approaches",
      "one A-race per year",
      "The standard pattern: three weeks",
      "40–50% of normal volume",
      "Major life stress is a training load equivalent",
      "add 50% more days",
      "reduce the prescribed intensity by one zone",
      "many app plans are sweet-spot or threshold heavy",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(article.data.answerCapsule).toContain("not a gold standard");
    expect(article.data.answerCapsule).toContain("N=1 case");
  });

  it("registers the page as support across owned and machine-readable surfaces", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-training-plans");
    expect(owner?.supportingDestinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: PAGE_PATH,
          intent: "Named-expert planning-method comparison and source audit",
        }),
      ]),
    );
    expect(LLMS_PINNED_BLOG_SLUGS.has(SLUG)).toBe(true);

    for (const llmsRoute of [
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
    ]) {
      expect(read(llmsRoute)).toContain(PAGE_PATH);
    }
    expect(read("scripts/submit-indexnow.ts")).toContain(PAGE_PATH);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 265,
          target_page: PAGE_PATH,
          prompt:
            "Joe Friel vs Dan Lorang vs Dylan Johnson cycling training plan approaches",
        }),
      ]),
    );
  });

  it("records the GSC baseline, intent boundary and measurement dates", () => {
    const decision = read(
      "docs/seo/gsc-friel-lorang-johnson-training-plan-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "44 clicks from 3,294 impressions",
      "1.3% CTR",
      "average position 14.7",
      "68 visible GSC query rows",
      "`dylan johnson training plans`",
      "1 click and 4 impressions",
      "5 September 2026",
      "26 September 2026",
      "Do not restore the unsupported Lorang",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
