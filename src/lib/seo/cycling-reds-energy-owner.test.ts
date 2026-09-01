import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "energy-availability-red-s-cyclists-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${OWNER}.mdx`));
const estimator = read(
  "src/app/(content)/tools/energy-availability/page.tsx",
);
const landing = read("src/lib/tools/landing-content.ts");

describe("cycling RED-S and energy availability search owner", () => {
  it("keeps the existing article as the reviewed clinical education owner", () => {
    expect(article.data.seoTitle).toBe(
      "RED-S in Cyclists: Symptoms, Energy Availability and Recovery",
    );
    expect(article.data.updatedDate).toBe("2026-09-01");
    expect(article.data.lastReviewed).toBe("2026-09-01");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(9);
    expect(article.data.faq).toHaveLength(10);

    for (const heading of [
      "RED-S, low energy availability and energy balance are different",
      "Why cyclists can be exposed to low energy availability",
      "Are 30 and 45 kcal/kg FFM/day clinical cut-offs?",
      "Can an energy availability calculator diagnose RED-S?",
      "Signs and symptoms of RED-S in cyclists",
      "Female cyclists: menstrual function and bone health",
      "Male cyclists: libido is relevant, testosterone is not the whole diagnosis",
      "Bone health: cycling adds an important reason to look",
      "How RED-S is assessed: the IOC CAT2 pathway",
      "Recovery and treatment",
      "Should a cyclist stop training?",
      "What the Roadman app can—and cannot—do",
    ]) {
      expect(article.content).toContain(heading);
    }
  });

  it("cites IOC, cycling, measurement, bone and intervention evidence", () => {
    for (const pmid of [
      "37752011",
      "37752002",
      "29207495",
      "33095376",
      "39287777",
      "33108971",
      "30364549",
      "31581498",
      "23256921",
      "41794545",
      "41878388",
      "38834182",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("turns the calculator into an estimate rather than a RED-S screen", () => {
    for (const marker of [
      "ENERGY AVAILABILITY ESTIMATOR",
      "ESTIMATE ONLY — NOT A RED-S TEST",
      "DAILY EXERCISE ENERGY EXPENDITURE",
      "The IOC does not treat them as universal clinical cut-offs",
      "/app?source=energy-availability-estimate",
      `/blog/${OWNER}`,
    ]) {
      expect(estimator).toContain(marker);
    }

    expect(estimator).not.toContain("ReportRequestForm");
    expect(estimator).not.toContain("riskLabels");
    expect(estimator).not.toContain("avgIntensity");
    expect(estimator).not.toContain("trainingHoursPerWeek");
    expect(estimator).not.toContain("screen for RED-S risk");
  });

  it("removes clinical traffic lights and fixed diet prescriptions", () => {
    const trusted = `${JSON.stringify(article.data)} ${article.content} ${estimator} ${landing}`.toLowerCase();
    for (const unsupported of [
      "below 30 kcal/kg ffm/day, physiological systems begin to shut down",
      "below 30 is clinical territory",
      "above 45 kcal/kg ffm/day. adequate. full physiological function is supported",
      "the 45 kcal/kg ffm/day target supports full physiological function in most athletes",
      "your energy availability is dangerously low",
      "your energy availability is in a healthy range",
      "dangerously low. red-s risk. increase intake",
      "full adaptation, full recovery",
      "the single number that decides",
      "a 12-week block at this rate moves you 5–8kg",
      "add 300-400 kcal/day to lift above the 30 threshold",
      "a comprehensive panel that covers thyroid, cortisol, testosterone",
      "if ea drops below 30 at any point, increase intake immediately",
      "the clinical cutoff is 30 kcal/kg ffm/day",
      "red-s risk screening (3 thresholds)",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("makes the estimator's structured landing copy match its safe scope", () => {
    for (const marker of [
      'title: "Energy Availability Estimator"',
      "It does not screen for or diagnose RED-S",
      "not a RED-S screener",
      "research reference points",
      `/blog/${OWNER}`,
    ]) {
      expect(landing).toContain(marker);
    }
  });

  it("routes both journeys into the single attributed app audience", () => {
    expect(article.content).toContain("](/app?source=reds-guide)");
    expect(estimator).toContain('href="/app?source=energy-availability-estimate"');
    expect(read("src/lib/app-acquisition.ts")).toContain('"reds-guide"');
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"energy-availability-estimate"',
    );
  });

  it("records the baseline and extends discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-cycling-reds-energy-owner-2026-09-01.md",
    );
    for (const signal of [
      "17 clicks",
      "2,119 web impressions",
      "0.8% CTR",
      "8.1 average position",
      "326 Google AI-feature impressions",
      "Prompt **380**",
    ]) {
      expect(brief).toContain(signal);
    }

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 380, target_page: `/blog/${OWNER}` }),
    );
  });
});
