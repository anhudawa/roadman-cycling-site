import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("sportive readiness index owner", () => {
  const guide = read("content/blog/sportive-training-readiness-index-2026.mdx");

  it("publishes the report instead of promising it", () => {
    expect(guide).toContain(
      "Sportive Readiness Index 2026: Are You Ready to Ride?",
    );
    expect(guide).toContain(
      "The Sportive Readiness Index 2026 is now published",
    );

    for (const staleClaim of [
      "Coming Q3 2026",
      "Publishing Q3 2026",
      "building this against real rider data",
      "same readiness rubric we use internally",
      "back-testing against rider results from this year's events",
      "calibrated against the event itself",
    ]) {
      expect(guide.toLowerCase()).not.toContain(staleClaim.toLowerCase());
    }
  });

  it("uses five evidence domains and refuses an invented pass score", () => {
    for (const marker of [
      "Domain 1: event map and constraints",
      "Domain 2: sustainable pacing, climbing and handling",
      "Domain 3: durability after prior work",
      "Domain 4: fuelling, hydration and gut tolerance",
      "Domain 5: training continuity, recovery and practical execution",
      "Confirmed",
      "Partial",
      "Not yet demonstrated",
      "Do not add the five domains into a percentage",
      "No outcome-validated composite score",
    ]) {
      expect(guide).toContain(marker);
    }
  });

  it("anchors event demands and evidence boundaries in named sources", () => {
    for (const marker of [
      "letapedutourdefrance.com",
      "marmottegranfondoalpes.com",
      "maratona.it/en/138km",
      "mallorca312.com/en/rules",
      "werideflanders.com",
      "PMID 40150840",
      "PMID 40613880",
      "PMID 26920240",
      "PMID 26423706",
      "PMID 23247672",
      "PMID 37163550",
    ]) {
      expect(guide).toContain(marker);
    }
  });

  it("publishes a versioned worksheet and citable AI-readable owner", () => {
    const csv = read("public/data/sportive-readiness-index-2026.csv");
    const llms = read("src/app/llms.txt/route.ts");
    const llmsFull = read("src/app/llms-full.txt/route.ts");

    expect(csv.trim().split("\n")).toHaveLength(11);
    expect(csv).toContain("1.0,domain,event map and constraints");
    expect(csv).toContain("1.0,checkpoint,protect the work,1 week");
    expect(guide).toContain('href="/data/sportive-readiness-index-2026.csv"');
    expect(guide).toContain("<CiteBlock");
    expect(llms).toContain("Sportive Readiness Index 2026");
    expect(llmsFull).toContain("/data/sportive-readiness-index-2026.csv");
  });

  it("separates the report from plans, tools, coaching and the app", () => {
    for (const marker of [
      "](/training-plans)",
      "](/plan)",
      "](/tools/training-readiness)",
      "](/tools/race-day-checklist)",
      "](/coaching/event-prep)",
      "](/app?source=sportive-readiness-index)",
    ]) {
      expect(guide).toContain(marker);
    }

    expect(
      SEARCH_OWNER_BY_ID.get("cycling-training-plans")?.supportingDestinations,
    ).toContainEqual(
      expect.objectContaining({
        path: "/blog/sportive-training-readiness-index-2026",
      }),
    );
  });

  it("records the real Web and AI baseline plus benchmark prompt", () => {
    const baseline = read(
      "docs/seo/gsc-sportive-readiness-index-2026-09-01.md",
    );
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(baseline).toContain("44 impressions");
    expect(baseline).toContain("average position 8.9");
    expect(baseline).toContain("Generative AI features: 2 impressions");
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts.find((prompt) => prompt.id === 384)).toMatchObject(
      {
        target_page: "/blog/sportive-training-readiness-index-2026",
      },
    );
  });
});
