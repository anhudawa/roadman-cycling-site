import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "cycling-cortisol-stress-performance-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${SLUG}.mdx`));

describe("cycling and cortisol search owner", () => {
  it("keeps a reviewed answer-first owner", () => {
    expect(article.data.title).toBe(
      "Cycling and Cortisol: Does Riding Raise or Lower It?",
    );
    expect(article.data.seoTitle).toBe(article.data.title);
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(8);
  });

  it("answers acute, chronic, testing, sleep, age and practical intent", () => {
    for (const answer of [
      "Your cortisol-and-cycling answer in 60 seconds",
      "What cortisol does during exercise",
      "Does cycling increase or spike cortisol?",
      "Intensity matters, but there is no universal threshold",
      "HIIT commonly produces a clear acute rise",
      "Duration, heat and fuelling change the cost",
      "Does cycling lower cortisol?",
      "The “one stress bucket” is a metaphor, not an equation",
      "Can symptoms tell you cortisol is high?",
      "HRV is not a cortisol monitor",
      "Should cyclists test cortisol?",
      "Sleep matters—without a made-up percentage",
      "Cortisol and masters cyclists",
      "A practical high-stress-week framework",
      "Where cortisol and stress fit in the Roadman app",
    ]) {
      expect(article.content).toContain(answer);
    }
  });

  it("cites direct exercise, cycling, sleep, age and monitoring evidence", () => {
    for (const pmid of [
      "18787373",
      "18642761",
      "34022085",
      "24198564",
      "37001634",
      "35777076",
      "29345524",
      "25230328",
      "28785411",
      "26563991",
      "38777757",
      "38991306",
      "34936049",
      "8548497",
      "23247672",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported cortisol diagnosis and universal promises", () => {
    const trusted = `${JSON.stringify(article.data)}\n${article.content}`.toLowerCase();
    for (const unsupported of [
      "single stress budget",
      "same hormonal reservoir",
      "decreases by exactly the same amount",
      "biochemically indistinguishable",
      "closest thing you have to a real-time cortisol monitor",
      "return can take 12-24 hours",
      "cortisol clearance slows with age",
      "takes twice as long",
      "reduces next-day cortisol by 20-30",
      "stubborn abdominal fat",
      "points to sympathetic dominance",
      "drains the stress bucket",
      "measurably lowers cortisol in the short term",
      "four-point salivary cortisol test",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("keeps measurement and autonomic intent with their owners", () => {
    expect(article.content).toContain(
      "](/blog/cycling-hrv-training-guide)",
    );
    expect(article.content).toContain(
      "](/blog/cycling-autonomic-nervous-system-recovery-guide)",
    );
  });

  it("routes app interest into the single attributed audience", () => {
    expect(article.content).toContain("](/app?source=cortisol-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"cortisol-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-cortisol-guide-hero",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cycling-cortisol-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "15",
      "1,494",
      "1.0%",
      "7.9",
      "381",
      "51 impressions",
      "prompt 370",
    ]) {
      expect(brief).toContain(signal);
    }
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${SLUG}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${SLUG}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 370, target_page: `/blog/${SLUG}` }),
    );
  });
});
