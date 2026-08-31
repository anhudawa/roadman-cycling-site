import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "best-recovery-foods-after-cycling";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("post-ride recovery food search owner", () => {
  it("preserves a reviewed, query-matched owner with direct meals", () => {
    expect(owner.data.seoTitle).toBe(
      "What to Eat After Cycling: Best Recovery Foods",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.reviewedBy).toContain("cited position statement");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.keyTakeaways).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(7);

    for (const directAnswer of [
      "Rice, chicken or tofu",
      "Baked potato, beans",
      "Eggs, toast and fruit",
      "Cereal, milk or fortified soy drink",
      "Banana-oat recovery smoothie",
    ]) {
      expect(owner.content).toContain(directAnswer);
    }
  });

  it("separates short-turnaround refuelling from normal recovery", () => {
    expect(owner.content).toContain("0–8 hours");
    expect(owner.content).toContain("About 8–24 hours");
    expect(owner.content).toContain("More than 24 hours");
    expect(owner.content).toContain("1.0–1.2 g");
    expect(owner.content).toContain("0.25–0.3 g/kg");
    expect(owner.content).toContain(
      "not a target after every easy spin",
    );
  });

  it("shows the population and study limits for common product claims", () => {
    for (const pmid of [
      "33507402",
      "26920240",
      "16676705",
      "20029509",
      "41945263",
      "24533082",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(owner.content).toContain("nine trained male cyclists");
    expect(owner.content).toContain("29 trials and 246 participants");
    expect(owner.content).toContain("about 12 standard drinks on average");
    expect(owner.content).toContain("no significant pooled effect for soreness");
  });

  it("removes magic-window, fixed-ratio and supplement overclaims", () => {
    const trusted = `${JSON.stringify(owner.data)} ${owner.content}`.toLowerCase();

    for (const unsupported of [
      "single most important nutritional window",
      "every minute you wait, that door closes",
      "the combination won",
      "the optimal ratio",
      "matched the commercial recovery drink endurox r4",
      "roughly a tenth of the price",
      "work like ibuprofen",
      "without the gut damage",
      "two to three pints after a hard ride impairs muscle protein synthesis by up to 37%",
      "aim to replace 150%",
      "under 15g",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("routes recovery nutrition into the same attributed app audience", () => {
    expect(owner.content).toContain(
      "](/app?source=recovery-nutrition)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"recovery-nutrition"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records GSC demand and updates AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-recovery-food-owner-2026-08-31.md");
    for (const signal of [
      "115 clicks",
      "13,418 impressions",
      "0.9% CTR",
      "average position 7.4",
      "4,083 impressions",
      "prompt 353",
    ]) {
      expect(brief).toContain(signal);
    }

    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${OWNER}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 353, target_page: `/blog/${OWNER}` }),
    );
  });
});

