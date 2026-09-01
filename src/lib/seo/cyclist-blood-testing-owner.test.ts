import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "blood-testing-cyclists-what-to-check-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));

describe("cyclist blood-testing search owner", () => {
  it("keeps one reviewed owner centred on test selection and interpretation", () => {
    expect(article.data.seoTitle).toBe(
      "Blood Tests for Cyclists: Which Tests Actually Matter?",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "Start with the question, not the panel",
      "More testing is not automatically better",
      "Clinical ranges do not “lie” to athletes",
      "Full blood count: useful, not an overtraining detector",
      "Iron and ferritin: assess the pattern and the risk",
      "Thyroid testing: more markers are not always more accurate",
      "Testosterone: symptoms plus repeat confirmation",
      "CRP: inflammation marker, not a readiness zone",
      "How to prepare for a cyclist blood test",
      "How often should cyclists test blood?",
      "The result-review checklist",
      "What the Roadman app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("cites clinical guidance and athlete biomarker evidence", () => {
    for (const official of [
      "https://www.nice.org.uk/guidance/ng145/chapter/Recommendations",
      "https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy",
    ]) {
      expect(article.content).toContain(official);
    }

    for (const pmid of [
      "16547143",
      "17062653",
      "18070805",
      "31055680",
      "37204619",
      "37752011",
      "23247672",
      "34496702",
      "31992987",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported ranges, schedules and diagnostic claims", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content}`.toLowerCase();

    for (const unsupported of [
      "ferritin below 50 ng/ml impairs",
      "athletic optimal sits between 50 and 150",
      "full blood count reveals early signs of overtraining",
      "crp above 3 mg/l during a rest week signals",
      "thyroid dysfunction affects up to 10%",
      "post-ride or mid-block panel is worse than no panel",
      "twice a year is the minimum",
      "three times per year gives better trend data",
      "clinically normal but athletically catastrophic",
      "ferritin: 50-150",
      "tsh: 0.5-2.5",
      "total testosterone (m)",
      "print this. take it to your blood draw",
      "push back harder",
      "if you are going to test one thing, test ferritin",
      "if you are over 40 and male, add",
      "blood chemistry problem",
      "8-12 weeks to confirm",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("preserves the narrower marker, fatigue, REDs and OTS owners", () => {
    for (const slug of [
      "cycling-chronic-fatigue-when-tiredness-persists-guide",
      "cycling-iron-ferritin-endurance-guide",
      "cycling-vitamin-d-performance-guide",
      "cycling-thyroid-function-performance-guide",
      "masters-cycling-hormones-performance-guide",
      "energy-availability-red-s-cyclists-guide",
      "cycling-recovering-from-overtraining-guide",
    ]) {
      expect(article.data.relatedPosts).toContain(slug);
      expect(fs.existsSync(path.join(ROOT, `content/blog/${slug}.mdx`))).toBe(
        true,
      );
    }
  });

  it("routes interest into the single attributed app audience", () => {
    expect(article.content).toContain("](/app?source=blood-testing-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"blood-testing-guide"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cyclist-blood-testing-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "18 clicks",
      "1,181 web impressions",
      "1.5% CTR",
      "7.1 average position",
      "386 Google AI-feature impressions",
      "Prompt **375**",
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
      expect.objectContaining({ id: 375, target_page: `/blog/${OWNER}` }),
    );
  });
});
