import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH = "content/blog/bike-fit-guide-cyclists.mdx";

describe("bike-fit search ownership and trust", () => {
  const guideSource = read(GUIDE_PATH);
  const { data, content } = matter(guideSource);
  const hubSource = read("content/topics/bike-fitting.mdx");
  const cyclingTech = read("content/topics/cycling-tech.mdx");

  it("publishes a reviewed canonical guide with a concise search proposition", () => {
    expect(data.seoTitle).toBe(
      "Bike Fitting Guide: Saddle Height, Cleats & Reach",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.primaryHub).toBe("bike-fitting");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("cited bike-fit");
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("links the fitting claims to named research and states its limits", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/32022807/",
      "https://pubmed.ncbi.nlm.nih.gov/22190163/",
      "https://pubmed.ncbi.nlm.nih.gov/34706617/",
      "https://pubmed.ncbi.nlm.nih.gov/35129429/",
      "https://pubmed.ncbi.nlm.nih.gov/40342376/",
      "https://pubmed.ncbi.nlm.nih.gov/35151569/",
    ]) {
      expect(guideSource).toContain(url);
    }

    expect(guideSource).toContain(
      "Pain or numbness is a signal to reduce the aggravating load and investigate. It is not a reliable diagnosis",
    );
    expect(guideSource).toContain(
      "There is no evidence-backed rule to buy a fit after five weekly hours or repeat one every two years",
    );
    expect(guideSource).toContain(
      "does not turn a generic web article into a personal assessment",
    );
  });

  it("removes universal watt, pain, cleat, price and age claims", () => {
    const governed = `${guideSource}\n${hubSource}\n${cyclingTech}`;
    for (const staleClaim of [
      "the cheapest free speed in cycling",
      "€150–€350",
      "If you ride 5+ hours a week",
      "shifting them 5–10mm back engages the glutes",
      "Run 4.5–6° of float",
      "cost up to 8% of your output",
      "find you 10-20 watts of free power",
      "eliminate chronic pain",
      "prevent the overuse injuries",
      "every two to three years is essential",
      "your flexibility at 45 is not your flexibility at 35",
    ]) {
      expect(governed).not.toContain(staleClaim);
    }
  });

  it("assigns the topic hub a directory role rather than duplicate head-term ownership", () => {
    const topics = read("src/lib/topics.ts");
    const block = topics
      .split('slug: "bike-fitting"')[1]
      ?.split("  },")[0];

    expect(block).toContain(
      'title: "Bike Fitting — Methods, Evidence & Rider Position"',
    );
    expect(block).toContain('"bike fitting knowledge"');
    expect(block).not.toContain('"bike fitting guide"');
    expect(hubSource).toContain(
      "The road guide owns the head term **bike fitting guide**",
    );
    expect(hubSource).toContain("Pain is not a bolt selector");
  });

  it("records the GSC decision and routes recrawl and AI measurement", () => {
    const decision = read(
      "docs/seo/gsc-bike-fit-opportunity-2026-08-25.md",
    );
    expect(decision).toContain("23,270 impressions");
    expect(decision).toContain("8,452 impressions");
    expect(decision).toContain("0.1% CTR");
    expect(decision).toContain("average position 6.7");

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 201,
        target_page: "/blog/bike-fit-guide-cyclists",
        priority: "high",
      }),
    );

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain("/blog/bike-fit-guide-cyclists");
    expect(indexNow).toContain("/topics/bike-fitting");
  });
});
