import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/daryl-fitzgerald-saddle-height-one-change.mdx";

describe("Daryl Fitzgerald saddle-height search trust", () => {
  const guide = read(GUIDE_PATH);
  const parsed = matter(guide);

  it("publishes a reviewed, transcript-checked entity owner", () => {
    expect(parsed.data.seoTitle).toBe(
      "Daryl Fitzgerald on Cycling Saddle Height",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain("transcript verification");
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
    expect(parsed.content.match(/^# /gm)).toBeNull();
    expect(guide).toContain(
      "This article was transcript-checked on 25 August 2026",
    );
  });

  it("preserves transcript claims with explicit evidence labels", () => {
    for (const claim of [
      "always saddle height",
      "Your saddle's a touch too high",
      "Go one mm at a time",
      "lowered it by about 7mm",
      "one minute faster",
      "20–30 watts",
      "Practitioner observation",
      "Individual case reported in interview",
    ]) {
      expect(guide).toContain(claim);
    }
    expect(guide).toContain(
      "one uncontrolled case",
    );
    expect(guide).toContain(
      "not a controlled crank-length trial",
    );
  });

  it("grounds Roadman analysis in current saddle-height evidence", () => {
    for (const url of [
      "/podcast/ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
      "https://pubmed.ncbi.nlm.nih.gov/34706617/",
      "https://pubmed.ncbi.nlm.nih.gov/32022807/",
      "https://pubmed.ncbi.nlm.nih.gov/35151569/",
      "https://pubmed.ncbi.nlm.nih.gov/39285616/",
    ]) {
      expect(guide).toContain(url);
    }
    expect(guide).toContain(
      "does not establish a population prevalence",
    );
    expect(guide).toContain(
      "Daryl Fitzgerald did not review or endorse Roadman's evidence analysis",
    );
  });

  it("removes universal and causal interpretations of the interview", () => {
    for (const staleClaim of [
      "saddle height is the single highest-impact fit change for most amateurs",
      "most amateurs have it a touch too high",
      "The seven-millimetre drop that bought a minute wasn't a freak result",
      "one fit change worth obsessing over",
      "you should only ever move it a millimetre at a time",
      "It is the least expensive, least glamorous performance work",
      "on Fitzgerald's evidence it can be worth a minute",
      "Get it right and all three improve together",
      "Get it wrong — and most amateurs",
      "it's how the pros do it",
      "the one thing most amateurs should get right",
      "one change most amateurs should make first",
      "You don't need a World Tour fitter",
    ]) {
      expect(guide).not.toContain(staleClaim);
    }
  });

  it("records the GSC decision and adds AI plus discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-daryl-saddle-height-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "1,682 impressions",
      "35 clicks",
      "2.1% CTR",
      "average position 7.3",
      "23 visible query rows",
      "`daryl fitzgerald`",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 210,
          target_page: "/blog/daryl-fitzgerald-saddle-height-one-change",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/blog/daryl-fitzgerald-saddle-height-one-change",
    );
  });
});
