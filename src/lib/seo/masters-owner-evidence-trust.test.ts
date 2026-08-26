import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { LLMS_PINNED_BLOG_SLUGS } from "./llms-content";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const page = read("src/app/(marketing)/masters/page.tsx");
const shortDiscovery = read("src/app/llms.txt/route.ts");
const fullDiscovery = read("src/app/llms-full.txt/route.ts");
const weeklyPlan = read(
  "content/blog/cycling-training-plan-masters-over-40.mdx",
);
const twelveWeekPlan = read(
  "content/blog/masters-cycling-training-plan-over-40.mdx",
);

describe("masters owner evidence trust", () => {
  it("publishes visible primary-source findings and limitations", () => {
    for (const phrase of [
      "WHAT THE EVIDENCE SUPPORTS — AND WHERE IT STOPS",
      "A historical eight-year study observed 5.5% per decade in 15 male masters athletes",
      "No universal clock is established",
      "No masters-cyclist trial establishes one universal 80/20 prescription",
      "did not establish an over-40 subgroup effect",
      "population-specific recommendations uncertain",
      "https://pubmed.ncbi.nlm.nih.gov/2361923/",
      "https://pubmed.ncbi.nlm.nih.gov/36078762/",
      "https://pubmed.ncbi.nlm.nih.gov/18268815/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
      "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      "https://pubmed.ncbi.nlm.nih.gov/39940356/",
      "https://pubmed.ncbi.nlm.nih.gov/26039963/",
    ]) {
      expect(page).toContain(phrase);
    }
  });

  it("removes universal age rules from the canonical owner", () => {
    for (const staleClaim of [
      "The session that needed 24 hours at 30 needs 48 to 72 now",
      "After 40 that's backwards",
      "Hard days spaced 48 to 72 hours apart",
      "Protein at 1.6 to 2.2 g/kg across the day",
      "Lift heavy and fast twice a week",
      "The 2025 meta-analysis is unambiguous",
      "The research is one-directional",
      "The 2024 study that settles the masters strength-vs-volume question",
    ]) {
      expect(page).not.toContain(staleClaim);
      expect(shortDiscovery).not.toContain(staleClaim);
      expect(fullDiscovery).not.toContain(staleClaim);
    }
  });

  it("updates owner schema and named human review", () => {
    expect(page).toContain(
      'buildSearchOwnerTrustProperties("masters-cycling")',
    );
    expect(page).toContain('dateModified: "2026-08-26"');
    expect(page).toContain("citation: EVIDENCE_CLAIMS.flatMap((claim) => [");
    expect(page).toContain('lastReviewed="26 August 2026"');
    expect(page).toContain(
      'reviewedBy="Anthony Walsh against the linked primary research and complete Roadman source interviews"',
    );
    expect(page).not.toContain('reviewedBy="Roadman Cycling coaching team"');
  });

  it("gives the overlapping training pages distinct owner relationships", () => {
    const owner = SEARCH_OWNER_BY_ID.get("masters-cycling");

    expect(owner?.supportingDestinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/blog/cycling-over-40-complete-guide",
          intent: expect.stringContaining("Broad over-40 overview"),
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

    const weekly = matter(weeklyPlan);
    expect(weekly.data.primaryHub).toBe("masters-cycling");
    expect(
      LLMS_PINNED_BLOG_SLUGS.has("cycling-training-plan-masters-over-40"),
    ).toBe(true);

    const indexNow = read("scripts/submit-indexnow.ts");
    for (const slug of [
      "cycling-over-40-complete-guide",
      "masters-cyclist-guide-getting-faster-after-40",
      "cycling-training-plan-masters-over-40",
      "masters-cycling-training-plan-over-40",
    ]) {
      expect(indexNow).toContain(`"${slug}"`);
    }
  });

  it("makes the weekly and 12-week child plans evidence-bounded", () => {
    const weekly = matter(weeklyPlan);
    const twelveWeek = matter(twelveWeekPlan);

    expect(weekly.data.updatedDate).toBe("2026-08-26");
    expect(twelveWeek.data.updatedDate).toBe("2026-08-26");
    expect(weekly.data.answerCapsule).toContain(
      "Age alone does not establish an 80/20 split",
    );
    expect(twelveWeek.data.answerCapsule).toContain(
      "Age alone does not prove an 80/20 split",
    );

    for (const article of [weeklyPlan, twelveWeekPlan]) {
      expect(article).toContain("https://pubmed.ncbi.nlm.nih.gov/18268815/");
      expect(article).toContain("https://pubmed.ncbi.nlm.nih.gov/39888556/");
      expect(article).toContain("https://pubmed.ncbi.nlm.nih.gov/40632222/");
      expect(article).not.toContain(
        "https://pubmed.ncbi.nlm.nih.gov/29346610/",
      );
    }

    for (const staleClaim of [
      "the 5% vs 10% VO2max rule",
      "Recovery from hard intensity takes 48-72 hours after 40",
      "Three is the threshold at which most riders over 40",
      "Strength training is non-negotiable after 40",
      "Recovery weeks every third week, not every fourth",
      "FTP gains of 5-15 per cent in a single year are common",
      "Every time. That's not motivational fluff",
    ]) {
      expect(weeklyPlan).not.toContain(staleClaim);
      expect(twelveWeekPlan).not.toContain(staleClaim);
    }
  });

  it("publishes corrected masters routing and benchmark prompts", () => {
    for (const discovery of [shortDiscovery, fullDiscovery]) {
      expect(discovery).toContain("/masters");
      expect(discovery).toContain(
        "/blog/cycling-training-plan-masters-over-40",
      );
      expect(discovery).toContain(
        "/blog/masters-cycling-training-plan-over-40",
      );
      expect(discovery).toContain("48-to-72-hour");
      expect(discovery).toContain("80/20");
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 268, target_page: "/masters" }),
        expect.objectContaining({ id: 269, target_page: "/masters" }),
      ]),
    );
  });

  it("records the GSC baseline, overlap and measurement contract", () => {
    const decision = read(
      "docs/seo/gsc-masters-owner-evidence-boundaries-2026-08-26.md",
    );
    for (const phrase of [
      "16 clicks, 331 impressions, 4.8% CTR and average position 12.6",
      "2 clicks, 106 impressions, 1.9% CTR and position 19.5",
      "0.780",
      "Do not redirect an established page",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(phrase);
    }
  });
});
