import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/cycling-training-camps-what-to-expect-guide.mdx";

describe("cycling training camp adaptation search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes a reviewed week-plan and recovery owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Cycling Training Camp Week Plan: Structure & Recovery",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("cited IOC consensus");
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
  });

  it("separates adaptation, preparation, first-timer and booking intent", () => {
    expect(parsed.content).toContain(
      "This page owns **cycling training camp week structure, daily fatigue decisions and the return to training after camp**",
    );
    for (const target of [
      "/blog/cycling-training-camp-preparation-guide",
      "/blog/what-to-expect-cycling-training-camp",
      "/training-camps",
      "/coaching",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.content).toContain(
      "not this evergreen adaptation article—are the source of truth",
    );
  });

  it("grounds load, monitoring, nutrition, sleep and recovery guidance", () => {
    for (const target of [
      "https://pubmed.ncbi.nlm.nih.gov/39639702/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC5013087/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/",
      "https://pubmed.ncbi.nlm.nih.gov/26891166/",
      "https://pubmed.ncbi.nlm.nih.gov/25970669/",
      "https://pubmed.ncbi.nlm.nih.gov/33144349/",
      "https://pubmed.ncbi.nlm.nih.gov/38753045/",
      "https://pubmed.ncbi.nlm.nih.gov/29742750/",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(7);
    expect(
      parsed.data.claims.every(
        (claim: { evidenceLevel: string; source: string }) =>
          claim.evidenceLevel === "strong" && claim.source.length > 20,
      ),
    ).toBe(true);
  });

  it("removes fixed schedules, guarantees, gadgets and stale commercial copy", () => {
    for (const staleClaim of [
      "Done well, it delivers two to three weeks of training adaptation in five to seven days",
      "Three hard days. Three easy days. One transition day. That is the pattern",
      "Most riders under-fuel at camp by 30 to 40 per cent",
      "Breakfast: 800-1,000 calories",
      "The recovery window is real",
      "One 500ml bottle per hour on the bike as a baseline",
      "Prioritise eight hours of sleep",
      "Put compression socks or tights on within an hour",
      "Twenty minutes with your feet up against a wall",
      "You want your body flushing metabolic waste",
      "keep it below 65 per cent of your maximum",
      "stay below 55 per cent of your FTP",
      "This is called supercompensation, and it takes 10 to 14 days",
      "immune suppression from a heavy training block takes five to seven days",
      "The Roadman camps at Can Sagnari run in October 2026 at EUR995",
      "Two full kits per riding day is ideal",
      "If you use magnesium before bed, bring it",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(parsed.content).toContain(
      "Direct evidence does not prove one universal cycling-camp schedule",
    );
    expect(parsed.content).toContain(
      "no single strategy produced consistent benefits",
    );
  });

  it("records the GSC decision and AI measurement prompt", () => {
    const decision = read(
      "docs/seo/gsc-training-camp-adaptation-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "309 impressions",
      "3 clicks",
      "1% CTR",
      "average position 26.9",
      "771 impressions",
      "position 7.9",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 214,
          target_page: "/blog/cycling-training-camps-what-to-expect-guide",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"cycling-training-camps-what-to-expect-guide"',
    );
  });
});
