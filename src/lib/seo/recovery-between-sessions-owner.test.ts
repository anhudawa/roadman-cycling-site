import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "recovery-between-hard-sessions-cycling";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${SLUG}.mdx`));

describe("recovery between hard cycling sessions search owner", () => {
  it("keeps a reviewed answer-first owner", () => {
    expect(article.data.title).toBe(
      "Recovery Between Hard Cycling Sessions: How Long?",
    );
    expect(article.data.seoTitle).toBe(
      "Recovery Between Hard Cycling Sessions: 24, 48 or 72 Hours?",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(8);
  });

  it("answers timing, session, masters, monitoring and recovery intent", () => {
    for (const answer of [
      "Your 24-, 48- or 72-hour decision",
      "Recovery is not one clock",
      "Session type changes the answer",
      "Is 48 hours the rule?",
      "Do masters cyclists need 72 hours after 40?",
      "How to decide whether you are recovered enough",
      "A simple decision table",
      "Do active recovery, massage or cold water shorten the gap?",
      "Sleep and nutrition: match urgency to the next session",
      "Are two hard sessions per week the ceiling?",
      "Sample patterns—not prescriptions",
      "Rest days do not erase fitness",
      "When spacing is not the real problem",
      "Where recovery spacing fits in the Roadman app",
    ]) {
      expect(article.content).toContain(answer);
    }
  });

  it("cites direct recovery, masters, monitoring and cycling evidence", () => {
    for (const pmid of [
      "38241464",
      "41740126",
      "25880787",
      "26423706",
      "33144349",
      "26888648",
      "38753045",
      "26891166",
      "28919842",
      "37821393",
      "37163550",
      "23247672",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal clocks, ceilings and readiness thresholds", () => {
    const trusted = `${JSON.stringify(article.data)}\n${article.content}`.toLowerCase();
    for (const unsupported of [
      "48 hours between hard sessions works for most",
      "after 40, extend to 72 hours",
      "the sustainable ceiling",
      "under 55 % of ftp",
      "within 5 beats of your baseline",
      "heart rate drift on the warm-up",
      "doms from a hard ride should resolve",
      "anything harder delays glycogen replenishment",
      "clear metabolic byproducts",
      "no hard training within 3 hours of bed",
      "fitness losses don't begin until roughly 7-10 days",
      "two hard days per week, fully recovered, beats",
      "every training session is a controlled dose of damage",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("links to the dedicated measurement and recovery owners", () => {
    for (const owner of [
      "cycling-hrv-training-guide",
      "resting-heart-rate-masters-cyclists",
      "cycling-active-recovery-rides-guide",
      "cycling-fatigue-signs-when-to-back-off",
    ]) {
      expect(article.content).toContain(`/blog/${owner}`);
    }
  });

  it("routes app interest into the single attributed audience", () => {
    expect(article.content).toContain(
      "](/app?source=between-sessions-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"between-sessions-guide"',
    );
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-between-sessions-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-recovery-between-sessions-owner-refresh-2026-08-31.md",
    );
    for (const signal of [
      "34",
      "4,520",
      "0.8%",
      "8.2",
      "810",
      "17 impressions",
      "prompt 371",
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
      expect.objectContaining({ id: 371, target_page: `/blog/${SLUG}` }),
    );
  });
});
