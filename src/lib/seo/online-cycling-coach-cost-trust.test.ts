import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/how-much-does-online-cycling-coach-cost-2026.mdx";

describe("online cycling coach cost search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes a reviewed, dated price-and-service audit", () => {
    expect(parsed.data.seoTitle).toBe(
      "Online Cycling Coach Cost 2026: Price & Service Audit",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("25 August 2026");
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

  it("defines a reproducible external sample and Roadman conflict", () => {
    expect(parsed.content).toContain(
      "14 publicly advertised recurring offers from four external cycling-coaching providers",
    );
    expect(parsed.content).toContain(
      "This is a convenience sample of public offers, not a statistical census",
    );
    expect(parsed.content).toContain(
      "Roadman is the publisher of this guide and sells both offers below",
    );
    expect(parsed.content).toContain("Not Done Yet is not presented here as named-coach private one-to-one");
    expect(parsed.content).toContain("do not use affiliate links");
  });

  it("cites official provider pages and distinguishes billing", () => {
    for (const target of [
      "https://www.cyclecoach.com/cycle-coach-services",
      "https://trainright.com/coaching/cycling/",
      "https://fascatcoaching.com/pages/hire-a-coach/",
      "https://www.teamwilpers.com/team-wilpers-private-coaching",
      "/coaching",
      "/inner-circle",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(5);
    expect(parsed.content).toContain(
      "A 52-week year contains 13 four-week billing cycles but only 12 calendar months",
    );
    expect(parsed.content).toContain(
      "The four-week version is 8.3% higher before any other difference",
    );
    expect(parsed.content).toContain("£150–£899/month");
    expect(parsed.content).toContain("$245–$1,295+/month");
  });

  it("keeps cost, selection, format and service ownership separate", () => {
    expect(parsed.content).toContain(
      "This page owns **online cycling coach cost, billing and service-price comparison**",
    );
    for (const target of [
      "/blog/best-online-cycling-coach-how-to-choose",
      "/compare/coach-vs-app",
      "/coaching",
      "/apply",
      "/find-your-fit",
    ]) {
      expect(source).toContain(target);
    }
  });

  it("removes unsupported tiers, gains, time rules and app-price intent", () => {
    for (const staleClaim of [
      "Online cycling coach cost runs $30-600+ per month",
      "Training apps like TrainerRoad and Zwift cost",
      "UK, EU and AU pricing tracks within 10%",
      "apps plateau most riders within 12-18 months",
      "5-15% performance gain",
      "Commit 12 weeks minimum",
      "give any coach 12 weeks before you judge",
      "beats a poorly matched tier 4 coach 80% of the time",
      "Under 6 hours per week, no A-race: tier 1",
      "8+ hours per week, multiple events",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(source).not.toContain("TrainerRoad");
    expect(source).not.toContain("Zwift");
    expect(parsed.content).toContain(
      "There is no evidence in this audit that a rider below six hours needs only an app",
    );
  });

  it("records the GSC decision, AI prompt and IndexNow owner", () => {
    const decision = read(
      "docs/seo/gsc-online-cycling-coach-cost-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "12,120 impressions",
      "89 clicks",
      "0.7% CTR",
      "average position 6.3",
      "trainerroad pricing 2026",
      "cycling coach cost",
      "250 query rows",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 217,
          target_page: "/blog/how-much-does-online-cycling-coach-cost-2026",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"how-much-does-online-cycling-coach-cost-2026"',
    );
  });
});
