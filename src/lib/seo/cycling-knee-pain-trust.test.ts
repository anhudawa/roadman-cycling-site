import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const CANONICAL_PATH = "content/blog/cycling-knee-pain-causes-fixes.mdx";
const CHECKLIST_PATH =
  "content/blog/knee-pain-cycling-what-to-check-first.mdx";
const RETIRED_PATH =
  "content/blog/cycling-knee-pain-prevention-treatment-guide.mdx";

describe("cycling knee-pain search ownership and trust", () => {
  const canonical = read(CANONICAL_PATH);
  const checklist = read(CHECKLIST_PATH);
  const canonicalMatter = matter(canonical);
  const checklistMatter = matter(checklist);

  it("publishes two reviewed pages with distinct propositions", () => {
    expect(canonicalMatter.data.seoTitle).toBe(
      "Cycling Knee Pain: Causes, Safe Checks & Red Flags",
    );
    expect(checklistMatter.data.seoTitle).toBe(
      "Knee Pain From Cycling: A Safe 10-Minute Check",
    );

    for (const page of [canonicalMatter, checklistMatter]) {
      expect(page.data.updatedDate).toBe("2026-08-25");
      expect(page.data.lastReviewed).toBe("2026-08-25");
      expect(page.data.reviewedBy).toContain("cited cycling-overuse");
      expect(page.content.match(/^# /gm)).toBeNull();
      expect(page.data.seoDescription.length).toBeGreaterThanOrEqual(120);
      expect(page.data.seoDescription.length).toBeLessThanOrEqual(160);
    }

    expect(canonical).toContain(
      "this page remains the broad evidence guide",
    );
    expect(checklist).toContain(
      "this page owns the diagnostic-checklist intent",
    );
  });

  it("grounds advice in named reviews and official clinical boundaries", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/35151569/",
      "https://pubmed.ncbi.nlm.nih.gov/29872355/",
      "https://pubmed.ncbi.nlm.nih.gov/34706617/",
      "https://pubmed.ncbi.nlm.nih.gov/32022807/",
      "https://pubmed.ncbi.nlm.nih.gov/35129429/",
      "https://pubmed.ncbi.nlm.nih.gov/39285616/",
      "https://www.nhs.uk/symptoms/knee-pain/",
    ]) {
      expect(canonical).toContain(url);
      expect(checklist).toContain(url);
    }

    expect(canonical).toContain(
      "Location is worth recording precisely",
    );
    expect(checklist).toContain(
      "Pain location narrows the interview; it does not select the fix",
    );
  });

  it("removes diagnosis maps, guaranteed fixes and invented timelines", () => {
    const rendered = `${canonical}\n${checklist}`;
    for (const staleClaim of [
      "where it hurts tells you why",
      "almost always a fit or training problem with a fix",
      "Most cycling knee pain is a fit problem dressed up as a medical problem",
      "The location of the pain is diagnostic",
      "raise it 5mm and ride for a week",
      "move them back 5–10mm",
      "Ninety per cent of cycling knee pain",
      "roughly nine out of ten cases are fixable",
      "increases patellofemoral compression by up to 20%",
      "A 2mm shift in fore-aft position or 3 degrees",
      "4-8 week problem",
      "12-26 week problem",
      "within a week",
      "10 per cent weekly volume rule exists for a reason",
    ]) {
      expect(rendered).not.toContain(staleClaim);
    }
  });

  it("retires the duplicate and records the GSC-backed decision", () => {
    expect(existsSync(resolve(root, RETIRED_PATH))).toBe(false);

    const redirects = read("next.config.ts");
    expect(redirects).toContain(
      'source: "/blog/cycling-knee-pain-prevention-treatment-guide"',
    );
    expect(redirects).toContain(
      'destination: "/blog/cycling-knee-pain-causes-fixes"',
    );

    const decision = read(
      "docs/seo/gsc-cycling-knee-pain-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "29,568 impressions",
      "26,578 impressions",
      "4,624 impressions",
      "0.3% CTR",
      "position of 27.4",
    ]) {
      expect(decision).toContain(signal);
    }
  });

  it("routes AI measurement and recrawl to the surviving owners", () => {
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 205,
          target_page: "/blog/cycling-knee-pain-causes-fixes",
        }),
        expect.objectContaining({
          id: 206,
          target_page: "/blog/knee-pain-cycling-what-to-check-first",
        }),
      ]),
    );

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain("/blog/cycling-knee-pain-causes-fixes");
    expect(indexNow).toContain(
      "/blog/knee-pain-cycling-what-to-check-first",
    );
    expect(indexNow).toContain(
      "/blog/cycling-knee-pain-prevention-treatment-guide",
    );
  });
});
