import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/bike-fit-one-change-amateurs-should-make.mdx";

describe("amateur bike-fit decision search trust", () => {
  const guide = read(GUIDE_PATH);
  const parsed = matter(guide);

  it("publishes a reviewed answer to the one-change premise", () => {
    expect(parsed.data.seoTitle).toBe(
      "The #1 Bike-Fit Change for Amateur Cyclists?",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain(
      "cited cycling-position, saddle-height, cleat",
    );
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
      "no single saddle, cleat or handlebar adjustment every amateur cyclist should make",
    );
  });

  it("routes detailed intents to distinct reviewed owners", () => {
    expect(guide).toContain(
      "This page owns the narrow question “what is the one bike-fit change?”",
    );
    expect(guide).toContain("/blog/bike-fit-guide-cyclists");
    expect(guide).toContain(
      "/blog/cycling-knee-tracking-cleat-setup-guide",
    );
    expect(guide).toContain(
      "/blog/knee-pain-cycling-what-to-check-first",
    );
  });

  it("grounds cleat, saddle and fitting limits in primary evidence", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/39285616/",
      "https://pubmed.ncbi.nlm.nih.gov/35129429/",
      "https://pubmed.ncbi.nlm.nih.gov/34706617/",
      "https://pubmed.ncbi.nlm.nih.gov/32022807/",
      "https://pubmed.ncbi.nlm.nih.gov/35151569/",
      "https://pubmed.ncbi.nlm.nih.gov/34540268/",
      "https://pubmed.ncbi.nlm.nih.gov/36232250/",
      "https://pubmed.ncbi.nlm.nih.gov/40910034/",
    ]) {
      expect(guide).toContain(url);
    }
    expect(guide).toContain(
      "no clear general recommendation for cleat position",
    );
  });

  it("removes universal millimetre rules and guaranteed returns", () => {
    for (const staleClaim of [
      "Move your cleats back 5–10mm",
      "Move your cleats back 5-10mm",
      "Five minutes with a hex key. It fixes",
      "five minutes with a hex key, instant improvement",
      "cleats too far forward load the calf and disengage the posterior chain",
      "glutes and hamstrings start doing the work",
      "drop it 5mm and ride a week",
      "pays back in comfort and watts inside a few rides",
      "Poor fit is the most common cause of",
      "more power, less fatigue, on every ride",
      "finishing it with your calves cramping on every climb",
    ]) {
      expect(guide).not.toContain(staleClaim);
    }
  });

  it("records the GSC decision and adds AI plus discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-amateur-bike-fit-one-change-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "3,130 impressions",
      "60 clicks",
      "1.9% CTR",
      "average position 6.1",
      "147 visible query rows",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 209,
          target_page: "/blog/bike-fit-one-change-amateurs-should-make",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/blog/bike-fit-one-change-amateurs-should-make",
    );
  });
});
