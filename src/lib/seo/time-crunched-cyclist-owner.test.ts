import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const OWNER = "time-crunched-cyclist-8-hours-week";
const OWNER_PATH = `/blog/${OWNER}`;
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("time-crunched cyclist search owner", () => {
  it("keeps the established owner and matches the plan intent", () => {
    const article = matter(read(`content/blog/${OWNER}.mdx`));

    expect(article.data.seoTitle).toBe(
      "Time-Crunched Cyclist: 8-Hour Training Plan (2026)",
    );
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.reviewedBy).toContain("Anthony Walsh");
    expect(article.data.primaryHub).toBe("cycling-training-plans");
    expect(article.data.faq).toHaveLength(5);
    expect(article.content).toContain("### Recovery-limited version");
    expect(article.content).toContain("## Sources and evidence limits");
    expect(article.content).not.toContain("| Day | Session | Time | Purpose |");
  });

  it("replaces universal prescriptions with source-bounded decisions", () => {
    const article = matter(read(`content/blog/${OWNER}.mdx`));

    expect(article.data.citedClaims).toHaveLength(4);
    expect(article.data.citedClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidenceSource: expect.stringContaining("10.1152/japplphysiol.00652.2012"),
        }),
        expect.objectContaining({
          evidenceSource: expect.stringContaining("10.1007/s40279-024-02149-3"),
        }),
      ]),
    );
    expect(article.data.answerCapsule).toContain("no study proves");
    expect(article.content).toContain("sample was small, male-only and short-term");
    expect(article.content).not.toContain("The two non-negotiable sessions");
    expect(article.content).not.toContain("protect the threshold session first");
    expect(article.content).not.toContain("Seiler's data on this is unambiguous");
  });

  it("records the exact-query baseline and extends discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-time-crunched-cyclist-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("35 clicks");
    expect(decision).toContain("3,713 impressions");
    expect(decision).toContain("0.9% CTR");
    expect(decision).toContain("Average position 6.5");
    expect(decision).toContain("3,584");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Time-Crunched Cyclist: 8-Hour Training Plan",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER);

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 231,
        target_page: OWNER_PATH,
        prompt:
          "what is the best training plan for a time crunched cyclist with 8 hours a week",
      }),
    );
  });

  it("keeps the generator source aligned with the reviewed owner", () => {
    const generator = read("scripts/data/coaching-cluster-articles.ts");
    expect(generator).toContain(
      'seoTitle: "Time-Crunched Cyclist: 8-Hour Training Plan (2026)"',
    );
    expect(generator).toContain('"Recovery-limited version"');
    expect(generator).toContain(
      '{ href: "/coaching/time-crunched", anchor: "time-crunched coaching" }',
    );
  });
});
