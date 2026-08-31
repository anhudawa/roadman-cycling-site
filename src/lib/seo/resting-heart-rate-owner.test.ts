import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "resting-heart-rate-masters-cyclists";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("resting heart rate for cyclists search owner", () => {
  it("keeps the established URL as one reviewed broad owner", () => {
    expect(owner.data.seoTitle).toBe(
      "Resting Heart Rate for Cyclists: Normal & Red Flags",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
  });

  it("answers the broad cyclist and professional-cyclist query family", () => {
    for (const answer of [
      "Your resting-heart-rate decision in 60 seconds",
      "What resting heart rate actually measures",
      "What is normal for a cyclist?",
      "What is a professional cyclist's resting heart rate?",
      "How to measure resting heart rate consistently",
      "How much change means a cyclist should rest?",
      "Can resting heart rate detect fatigue or overtraining?",
      "Low resting heart rate in cyclists: fitness or bradycardia?",
      "Elevated resting heart rate: training, illness or something else?",
      "Resting heart rate for masters cyclists",
      "RHR vs HRV vs heart-rate recovery",
      "A practical training framework",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites training, monitoring, device and athlete-health evidence", () => {
    for (const pmid of [
      "30513777",
      "18308872",
      "26423706",
      "32552580",
      "28329355",
      "41941267",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
    expect(owner.content).toContain("https://www.heart.org/");
  });

  it("removes universal bands, bpm commands and wearable diagnoses", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "40–48 bpm: highly trained",
      "48–58 bpm: well-trained",
      "3–5 bpm above baseline",
      "5–7 bpm above baseline",
      "10+ bpm above baseline",
      "almost always illness",
      "professional teams typically act",
      "lower resting heart rate = improved fitness",
      "confirms your recovery is working",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("aligns related recovery answers and discovery surfaces", () => {
    const recovery = read("src/lib/answers-data/recovery.ts");
    const problems = read("src/lib/problems.ts");
    for (const phrase of [
      "No fixed resting-heart-rate, HRV, duration or symptom-count threshold",
      "There is no measurement that proves a cyclist is fully recovered",
      "there is no universal 3-to-5-day trend or 4-to-6-week baseline rule",
    ]) {
      expect(recovery).toContain(phrase);
    }
    expect(problems).toContain(
      "no universal bpm or day threshold diagnoses the cause",
    );
    expect(read("content/topics/cycling-recovery.mdx")).toContain(
      `](/blog/${OWNER})`,
    );
    expect(read("content/topics/masters-cycling.mdx")).toContain(
      `](/blog/${OWNER})`,
    );
  });

  it("routes app demand into the existing single attributed audience", () => {
    expect(owner.content).toContain("](/app?source=rhr-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"rhr-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-rhr-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-resting-heart-rate-owner-2026-08-31.md");
    for (const signal of [
      "93",
      "10.9K",
      "3.17K",
      "6.5",
      "prompt 362",
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
      expect.objectContaining({ id: 362, target_page: `/blog/${OWNER}` }),
    );
  });
});
