import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cold-water-immersion-cyclists";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cold water immersion for cyclists search owner", () => {
  it("keeps one reviewed broad owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Cold Water Immersion for Cyclists: Benefits & Risks",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers recovery, adaptation, protocol and safety intent", () => {
    for (const answer of [
      "Your cold-water decision in 60 seconds",
      "What does cold water immersion actually improve?",
      "Does cold water immersion blunt cycling adaptation?",
      "Strength adaptation: a real caution",
      "Endurance adaptation: harm is not established",
      "Temperature, duration and timing",
      "Cold-water safety for cyclists",
      "What about cold showers?",
      "Ice baths after cycling versus after strength training",
      "Where cold water fits in the recovery hierarchy",
      "A practical cold-water protocol decision",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites acute, chronic, protocol and safety evidence", () => {
    for (const pmid of [
      "36862831",
      "35157264",
      "33146851",
      "35068365",
      "35254558",
      "41845491",
      "40078372",
      "22547634",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
    expect(owner.content).toContain("https://www.heart.org/");
  });

  it("removes blanket adaptation, protocol and shower claims", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "quietly cancels your training",
      "you iced the signal away",
      "can cancel part of the work",
      "the benefit disappears the moment intensity creeps up",
      "colder and longer raises the risk without adding benefit",
      "cold showers are a milder version with lower benefit",
      "don't lose sleep over a cold shower blunting your gains",
      "used on rest days or after endurance work, it appears neutral-to-positive",
      "use it before events, not routinely after training",
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
      recovery.indexOf('slug: "do-ice-baths-help-cycling-recovery"'),
      recovery.indexOf("// HOW TO RECOVER BETWEEN BACK-TO-BACK TRAINING DAYS"),
    );
    expect(direct).toContain(
      "reviews have not found reduced endurance performance adaptation",
    );
    expect(direct).toContain(`/blog/${OWNER}`);
    expect(direct).not.toContain("dunking yourself in ice");
    expect(direct).not.toContain("Leave a long gap");
  });

  it("routes product interest into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=cold-water-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"cold-water-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-cold-water-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cold-water-immersion-owner-2026-08-31.md",
    );
    for (const signal of ["27", "2,443", "1.1%", "6.6", "646", "prompt 364"]) {
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
      expect.objectContaining({ id: 364, target_page: `/blog/${OWNER}` }),
    );
  });
});
