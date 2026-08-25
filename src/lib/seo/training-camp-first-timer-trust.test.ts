import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/what-to-expect-cycling-training-camp.mdx";

describe("first cycling training camp search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes a reviewed first-timer owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Cycling Training Camp: What to Expect First Time",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("camp operations team");
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

  it("keeps first-timer, preparation, adaptation and booking intent separate", () => {
    expect(parsed.content).toContain(
      "This page owns **first-time cycling training camp expectations and booking questions**",
    );
    for (const target of [
      "/blog/cycling-training-camp-preparation-guide",
      "/blog/cycling-training-camps-what-to-expect-guide",
      "/training-camps",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.content).toContain(
      "Those booking pages—not this editorial article—are the source of truth",
    );
  });

  it("grounds nutrition, sleep and travel guidance in named sources", () => {
    for (const target of [
      "https://pubmed.ncbi.nlm.nih.gov/26891166/",
      "https://pubmed.ncbi.nlm.nih.gov/25970669/",
      "https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf",
      "https://www.gov.uk/foreign-travel-advice/spain/health",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(5);
    expect(
      parsed.data.claims.every(
        (claim: { evidenceLevel: string; source: string }) =>
          claim.evidenceLevel === "strong" && claim.source.length > 20,
      ),
    ).toBe(true);
    expect(parsed.content).toContain("30–60g of carbohydrate per hour");
    expect(parsed.content).toContain("seven or more hours per night");
  });

  it("removes universal camp rules, unsafe packing and stale availability", () => {
    for (const staleClaim of [
      "Two pace groups is the bar for a serious camp",
      "You won't be — pace groups are sorted on day one",
      "six months of consistent riding behind you",
      "comfortable 90 km distance",
      "Cycling fitness is built in sleep, not on the bike",
      "Eight and a half hours every night",
      "Two full kits per riding day",
      "high-strength embrocation",
      "Paracetamol, ibuprofen",
      "A serious training camp in Europe runs €1,500–3,000",
      "If a camp pitches itself as serious and there's no follow car",
      "the only thing left to do is pick your week",
      "Will I fit in?\"** Yes",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(parsed.content).toMatch(/there is no evidence-based rule/i);
    expect(parsed.content).toContain("Girona Road Camp](/training-camps/girona-road) is marked sold out");
    expect(parsed.content).toContain("availability handled on its live page");
  });

  it("records the GSC decision and AI measurement prompt", () => {
    const decision = read(
      "docs/seo/gsc-training-camp-first-timer-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "1,060 impressions",
      "10 clicks",
      "0.9% CTR",
      "average position 10.8",
      "`cycling training camp`",
      "0 | 122",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 212,
          target_page: "/blog/what-to-expect-cycling-training-camp",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"what-to-expect-cycling-training-camp"',
    );
  });
});
