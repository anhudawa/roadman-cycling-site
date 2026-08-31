import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-rest-day-what-to-do-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling rest-day search owner", () => {
  it("keeps one reviewed broad owner and distinct supporting intents", () => {
    expect(owner.data.seoTitle).toBe(
      "Rest Days for Cyclists: How Many & What to Do",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
    expect(fs.existsSync(path.join(ROOT, "content/blog/cycling-active-recovery-rides-guide.mdx"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "content/blog/cycling-recovery-week-what-to-actually-do.mdx"))).toBe(true);
  });

  it("answers the broad rest-day query family directly", () => {
    for (const answer of [
      "Your cycling rest-day decision in 60 seconds",
      "Rest day, easy day, active recovery or recovery week?",
      "How many rest days should a cyclist take?",
      "Will one rest day reduce cycling fitness?",
      "Is active recovery better than complete rest?",
      "What should cyclists actually do on a rest day?",
      "Should strength training go on a cycling rest day?",
      "When should a cyclist add an unplanned rest day?",
      "Rest days for masters cyclists",
      "A practical weekly framework",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites recovery, monitoring, sleep, nutrition, detraining and masters evidence", () => {
    for (const pmid of [
      "38753045",
      "29742750",
      "26423706",
      "33144349",
      "26891166",
      "36017396",
      "37163550",
      "25880787",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal thresholds and guaranteed recovery claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "below 50 per cent of maximum heart rate",
      "can accelerate recovery compared to full bed rest",
      "resting heart rate is five or more beats elevated",
      "every third day of hard training",
      "any two of those signals",
      "natural killer cell activity by roughly 70 per cent",
      "measurable detraining effects take at least 7-10 days",
      "extra hour of sleep delivers more recovery benefit",
      "16 to 18 degrees celsius",
      "one rest day per week is almost certainly not enough",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns the recovery answers and topic hubs with the owner", () => {
    const recovery = read("src/lib/answers-data/recovery.ts");
    const restAnswer = recovery.slice(
      recovery.indexOf('slug: "how-many-rest-days-cycling"'),
      recovery.indexOf("// 5 — ACTIVE OR PASSIVE RECOVERY"),
    );
    expect(restAnswer).toContain("There is no universal number of rest days");
    expect(restAnswer).toContain(`/blog/${OWNER}`);
    expect(restAnswer).not.toContain("two rest days before returning");
    expect(restAnswer).not.toContain("If all four are present");

    for (const hub of [
      "content/topics/cycling-recovery.mdx",
      "content/topics/masters-cycling.mdx",
    ]) {
      expect(read(hub), hub).toContain(`](/blog/${OWNER})`);
    }
  });

  it("routes product interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=rest-day-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"rest-day-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-rest-day-guide-hero",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-rest-day-owner-2026-08-31.md");
    for (const signal of ["21", "3,834", "0.5%", "6.6", "400", "prompt 363"]) {
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
      expect.objectContaining({ id: 363, target_page: `/blog/${OWNER}` }),
    );
  });
});
