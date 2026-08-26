import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/best-online-cycling-coach-how-to-choose.mdx";

describe("online cycling coach selection search trust", () => {
  const source = read(GUIDE_PATH);
  const parsed = matter(source);

  it("publishes the reviewed nine-point selection owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "How to Choose an Online Cycling Coach (2026 Checklist)",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-26");
    expect(parsed.data.lastReviewed).toBe("2026-08-26");
    expect(parsed.data.reviewedBy).toContain("health-data");
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
    expect(parsed.content.match(/^## [1-9]\. /gm)).toHaveLength(9);
  });

  it("keeps selection, service, cost and format ownership separate", () => {
    expect(parsed.content).toContain(
      "This page owns **how to choose and compare an online cycling coach**",
    );
    for (const target of [
      "/coaching",
      "/blog/how-much-does-online-cycling-coach-cost-2026",
      "/compare/coach-vs-app",
      "/coaching/masters",
      "/find-your-fit",
      "/apply",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.content).toContain(
      "Roadman sells [online cycling coaching](/coaching), so this article has a commercial conflict",
    );
  });

  it("covers qualifications, scope, service, data, proof and terms", () => {
    for (const phrase of [
      "Can you verify credentials, insurance and safeguarding?",
      "Is the coach clear about professional scope?",
      "What exactly gets reviewed and adapted?",
      "Who can see your training and health data?",
      "Is the evidence credible rather than theatrical?",
      "Are the price, contract and exit terms complete?",
      "Nine questions to send every coach",
    ]) {
      expect(parsed.content).toContain(phrase);
    }
    for (const target of [
      "https://www.britishcycling.org.uk/recognised",
      "https://www.britishcycling.org.uk/coachesinsurance",
      "https://www.britishcycling.org.uk/Coaches-Code-of-Practice",
      "https://www.britishcycling.org.uk/safeguardingtraining",
      "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/",
      "https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements",
    ]) {
      expect(source).toContain(target);
    }
    expect(parsed.data.claims).toHaveLength(4);
  });

  it("removes unsupported universal and confidentiality-hostile advice", () => {
    for (const staleClaim of [
      "regular communication (weekly minimum)",
      "For most amateur cyclists, online coaching is equally effective",
      "Weekly communication is the floor, not the ceiling",
      "when you're paying 150-300 per month",
      "Any confident coach will connect you with current or former athletes",
      "Three months is enough to assess whether the coaching relationship is working",
      "At minimum, weekly",
      "can't give you concrete examples of client success",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
    expect(parsed.content).toContain(
      "There is no evidence-based universal rule that every athlete must receive weekly contact",
    );
    expect(parsed.content).toContain(
      "Do not insist that a coach disclose private client identities or connect you with references",
    );
    expect(parsed.content).toContain(
      "There is no universal three-month trial that proves coaching effectiveness",
    );
  });

  it("records the GSC decision, AI prompt and IndexNow owner", () => {
    const decision = read(
      "docs/seo/gsc-online-cycling-coach-selection-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "7,312 impressions",
      "115 clicks",
      "1.6% CTR",
      "average position 11",
      "online cycling coach",
      "my cycling coach cost",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 216,
          target_page: "/blog/best-online-cycling-coach-how-to-choose",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"best-online-cycling-coach-how-to-choose"',
    );
  });
});
