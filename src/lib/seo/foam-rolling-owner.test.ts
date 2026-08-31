import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-foam-rolling-self-massage-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("foam rolling for cyclists search owner", () => {
  it("keeps one reviewed broad owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Foam Rolling for Cyclists: Benefits & Routine",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers soreness, performance, timing, routine and safety intent", () => {
    for (const answer of [
      "Your foam-rolling decision in 60 seconds",
      "What does foam rolling actually do?",
      "Does foam rolling improve cycling performance?",
      "Range of motion: useful, but not unique",
      "Does it “release fascia” or break adhesions?",
      "What about the IT band?",
      "Before or after cycling?",
      "An eight-minute cycling foam-roller routine",
      "Foam-rolling safety",
      "Foam roller, massage gun or professional massage?",
      "Where foam rolling fits in recovery",
      "A practical foam-rolling decision",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites reviews, cycling trials and safety consensus", () => {
    for (const pmid of [
      "31024339",
      "31628662",
      "38244921",
      "38760635",
      "36227232",
      "42391131",
      "34055172",
      "41745684",
      "36141907",
      "34830642",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes mechanical, universal and unsafe protocol claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "10-15 per cent reduction",
      "benefit is perceptual, not physiological",
      "one inch per second",
      "pausing on tender spots for 20-30 seconds",
      "psoas — shortens and stiffens over time",
      "produces measurably better results",
      "timing: within the first hour post-ride is ideal",
      "it has the tensile strength of soft steel",
      "owning both is ideal",
      "you need something smaller and firmer",
      "adhesions and reduces the ability",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns the recovery hub and direct answers with the owner", () => {
    expect(read("content/topics/cycling-recovery.mdx")).toContain(
      `](/blog/${OWNER})`,
    );

    const recovery = read("src/lib/answers-data/recovery.ts");
    const direct = recovery.slice(
      recovery.indexOf('slug: "foam-rolling-massage-recovery"'),
      recovery.indexOf("// MONITORING RECOVERY AND READINESS"),
    );
    expect(direct).toContain("Cycling-specific evidence does not establish");
    expect(direct).toContain(`/blog/${OWNER}`);
    expect(direct).not.toContain("improving tissue compliance");
    expect(direct).not.toContain("roughly 24–48 hours");
  });

  it("routes product interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=foam-rolling-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"foam-rolling-guide"',
    );
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-foam-rolling-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-foam-rolling-owner-2026-08-31.md");
    for (const signal of ["11", "2,031", "0.5%", "10.9", "200", "prompt 365"]) {
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
      expect.objectContaining({ id: 365, target_page: `/blog/${OWNER}` }),
    );
  });
});
