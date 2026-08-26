import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { LLMS_PINNED_BLOG_SLUGS } from "./llms-content";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const completeSource = read("content/blog/cycling-over-40-complete-guide.mdx");
const plateauSource = read(
  "content/blog/masters-cyclist-guide-getting-faster-after-40.mdx",
);
const weeklySource = read(
  "content/blog/cycling-training-plan-masters-over-40.mdx",
);
const twelveWeekSource = read(
  "content/blog/masters-cycling-training-plan-over-40.mdx",
);
const topicBody = read("content/topics/masters-cycling.mdx");
const topicsSource = read("src/lib/topics.ts");

describe("masters supporting-page search intent", () => {
  it("preserves all four URLs from complete GSC page evidence", () => {
    const decision = read(
      "docs/seo/gsc-masters-supporting-intent-2026-08-26.md",
    );

    for (const row of [
      "| `/blog/cycling-over-40-complete-guide` | 21 | 1,451 | 1.4% | 10.5 |",
      "| `/blog/masters-cyclist-guide-getting-faster-after-40` | 7 | 1,481 | 0.5% | 7.0 |",
      "| `/blog/cycling-training-plan-masters-over-40` | 46 | 2,232 | 2.1% | 7.9 |",
      "| `/blog/masters-cycling-training-plan-over-40` | 57 | 2,480 | 2.3% | 9.1 |",
    ]) {
      expect(decision).toContain(row);
    }

    expect(decision).toContain("Preserve all four established URLs");
    expect(decision).toContain("Do not redirect");
  });

  it("assigns one distinct job to each masters destination", () => {
    const owner = SEARCH_OWNER_BY_ID.get("masters-cycling");

    expect(owner?.supportingDestinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/blog/cycling-over-40-complete-guide",
          intent: expect.stringContaining("Broad over-40 overview"),
        }),
        expect.objectContaining({
          path: "/blog/masters-cyclist-guide-getting-faster-after-40",
          intent: expect.stringContaining("plateau audit"),
        }),
        expect.objectContaining({
          path: "/blog/cycling-training-plan-masters-over-40",
          intent: expect.stringContaining("weekly scheduling"),
        }),
        expect.objectContaining({
          path: "/blog/masters-cycling-training-plan-over-40",
          intent: expect.stringContaining("Twelve-week"),
        }),
      ]),
    );

    const complete = matter(completeSource);
    const plateau = matter(plateauSource);
    const weekly = matter(weeklySource);
    const twelveWeek = matter(twelveWeekSource);

    expect(complete.data.title).toContain("Training, Fuel, Strength and Recovery");
    expect(plateau.data.title).toContain("3 Decisions");
    expect(weekly.data.title).toContain("Weekly Schedule");
    expect(twelveWeek.data.title).toContain("12-Week");
    expect(plateau.content).not.toContain("## A weekly template");
  });

  it("publishes named review, source boundaries and clinical limits", () => {
    for (const article of [completeSource, plateauSource]) {
      const parsed = matter(article);
      expect(parsed.data.primaryHub).toBe("masters-cycling");
      expect(parsed.data.updatedDate).toBe("2026-08-26");
      expect(parsed.data.lastReviewed).toBe("2026-08-26");
      expect(parsed.data.reviewedBy).toContain("Anthony Walsh");

      for (const source of [
        "https://pubmed.ncbi.nlm.nih.gov/2361923/",
        "https://pubmed.ncbi.nlm.nih.gov/36078762/",
        "https://pubmed.ncbi.nlm.nih.gov/18268815/",
        "https://pubmed.ncbi.nlm.nih.gov/39888556/",
        "https://pubmed.ncbi.nlm.nih.gov/40632222/",
        "https://pubmed.ncbi.nlm.nih.gov/39940356/",
      ]) {
        expect(article).toContain(source);
      }

      expect(article).toContain("qualified medical");
      expect(parsed.data.citedClaims.length).toBeGreaterThanOrEqual(4);
      for (const claim of parsed.data.citedClaims) {
        expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
          claim.evidenceLevel,
        );
      }
      expect(parsed.data.faq.length).toBeGreaterThanOrEqual(5);
      expect(parsed.data.howTo.steps.length).toBeGreaterThanOrEqual(6);
    }

    for (const claim of matter(twelveWeekSource).data.citedClaims) {
      expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
        claim.evidenceLevel,
      );
    }
  });

  it("removes contradictory universal rules from the revised surfaces", () => {
    const enrichmentStart = topicsSource.indexOf('  "masters-cycling": {');
    const enrichmentEnd = topicsSource.indexOf(
      '  "ftp-training": {',
      enrichmentStart,
    );
    const mastersEnrichment = topicsSource.slice(enrichmentStart, enrichmentEnd);
    const faqStart = topicsSource.indexOf('  "masters-cycling": [', enrichmentEnd);
    const faqEnd = topicsSource.indexOf('  "ftp-training": [', faqStart);
    const mastersFaq = topicsSource.slice(faqStart, faqEnd);
    const revised = [
      completeSource,
      plateauSource,
      topicBody,
      mastersEnrichment,
      mastersFaq,
    ];
    const staleClaims = [
      "The science is clear and encouraging",
      "The 80/20 distribution holds",
      "Strength training becomes essential rather than optional",
      "Two sessions a week is the sweet spot",
      "Most masters riders need 48–72 hours",
      "Lift twice weekly in the build phase",
      "the masters subset is the most compelling",
      "it's settled science and proven practice",
    ];

    for (const staleClaim of staleClaims) {
      for (const source of revised) expect(source).not.toContain(staleClaim);
    }

    expect(completeSource).toContain(
      "no statistically significant overall difference between polarised and pyramidal",
    );
    expect(plateauSource).toContain("A plateau is a decision problem");
    expect(topicBody).toContain("guide library");
    expect(mastersFaq).toContain("There is no age-only interval");
  });

  it("routes AI discovery and recurring submission to the same jobs", () => {
    const shortDiscovery = read("src/app/llms.txt/route.ts");
    const fullDiscovery = read("src/app/llms-full.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");

    for (const discovery of [shortDiscovery, fullDiscovery]) {
      expect(discovery).toContain("/blog/cycling-over-40-complete-guide");
      expect(discovery).toContain(
        "/blog/masters-cyclist-guide-getting-faster-after-40",
      );
      expect(discovery).toContain("plateau");
      expect(discovery).toContain("weekly");
      expect(discovery).toContain("Twelve-week");
    }

    for (const slug of [
      "cycling-over-40-complete-guide",
      "masters-cyclist-guide-getting-faster-after-40",
      "cycling-training-plan-masters-over-40",
      "masters-cycling-training-plan-over-40",
    ]) {
      expect(LLMS_PINNED_BLOG_SLUGS.has(slug)).toBe(true);
      expect(indexNow).toContain(`"${slug}"`);
    }
    expect(indexNow).toContain("/topics/masters-cycling");
  });

  it("adds exact AI benchmarks for all four supporting intents", () => {
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 306,
          target_page: "/blog/cycling-over-40-complete-guide",
        }),
        expect.objectContaining({
          id: 307,
          target_page: "/blog/masters-cyclist-guide-getting-faster-after-40",
        }),
        expect.objectContaining({
          id: 308,
          target_page: "/blog/cycling-training-plan-masters-over-40",
        }),
        expect.objectContaining({
          id: 309,
          target_page: "/blog/masters-cycling-training-plan-over-40",
        }),
      ]),
    );
  });
});
