import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { strengthAnswers } from "@/lib/answers-data/strength";

const ROOT = process.cwd();
const OWNER = "off-season-gym-routine-cyclists-12-week-block";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));
const generalOffSeason = matter(
  read("content/blog/off-season-training-cycling-what-to-do-guide.mdx"),
);
const concise = strengthAnswers.find(
  (answer) => answer.slug === "off-season-strength-training",
);

describe("off-season cyclist strength search owner", () => {
  it("preserves a reviewed, query-matched experienced-lifter owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Off-Season Strength Training for Cyclists: 12 Weeks",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.reviewedBy).toContain("cited cyclist");
    expect(owner.data.evidenceLevel).toBe("emerging");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.keyTakeaways).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(7);
    expect(owner.content).toContain("## The plan in 30 seconds");
    expect(owner.content).toContain("### Session A");
    expect(owner.content).toContain("### Session B");
    expect(owner.content).toContain("## How to place strength around cycling");
    expect(owner.content).toContain("## The recovery rules");
  });

  it("states the evidence boundary and population limits", () => {
    for (const pmid of ["40632222", "28292885", "28783467", "28702901"]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(owner.content).toContain("17 controlled studies, 262 participants");
    expect(owner.content).toContain("only 60 women");
    expect(owner.content).toContain("low certainty");
    expect(owner.content).toContain(
      "no study tested this exact Roadman sequence",
    );
    expect(owner.content).toContain("19 trained female duathletes");
  });

  it("keeps beginner, experienced and full-transition intent distinct", () => {
    expect(owner.content).toContain(
      "](/blog/cycling-strength-training-12-week-beginner-plan)",
    );
    expect(owner.content).toContain(
      "](/blog/off-season-training-cycling-what-to-do-guide)",
    );
    expect(concise?.directAnswer).toContain("If you already lift");
    expect(
      concise?.relatedTopics.some(
        (item) => item.href === `/blog/${OWNER}`,
      ),
    ).toBe(true);
  });

  it("removes universal prescription, transfer and exercise-ban claims", () => {
    const trusted = `${JSON.stringify(owner.data)} ${owner.content} ${JSON.stringify(concise)} ${JSON.stringify(generalOffSeason.data)} ${generalOffSeason.content}`.toLowerCase();

    for (const unsupported of [
      "the final block converts strength to power",
      "the only version of strength the bike cares about",
      "the bike's exact movement pattern",
      "never barbell back squats",
      "no heavy barbell compound lifts",
      "the highest gym frequency a cyclist should run",
      "twelve weeks is the reliable structure",
      "protects power all year",
      "if the load isn't climbing",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("routes the owner into one attributed app audience", () => {
    expect(owner.content).toContain(
      "](/app?source=off-season-strength)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"off-season-strength"',
    );
    expect(read("src/lib/seo/app-acquisition-paths.test.ts")).toContain(
      `content/blog/${OWNER}.mdx`,
    );
  });

  it("records the GSC decision and updates AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-off-season-strength-owner-2026-08-31.md",
    );
    for (const signal of [
      "45 clicks",
      "2,060 impressions",
      "2.2% CTR",
      "average position 11.6",
      "806 impressions",
      "prompt 352",
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
      expect.objectContaining({ id: 352, target_page: `/blog/${OWNER}` }),
    );
  });
});
