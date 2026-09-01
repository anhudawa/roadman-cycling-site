import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("amateur cyclist fuelling benchmarks owner", () => {
  const report = read(
    "content/blog/amateur-cyclist-fuelling-benchmarks-report-2026.mdx",
  );

  it("publishes an evidence benchmark instead of an unsupported roster study", () => {
    expect(report).toContain(
      "Amateur Cyclist Fuelling Benchmarks Report 2026 is now published",
    );
    expect(report).toContain("evidence-benchmark edition");
    expect(report).toContain(
      "does not have a representative population dataset",
    );

    for (const staleClaim of [
      "Coming Q3 2026",
      "Publishing Q3 2026",
      "data is drawn from the NDY coaching roster",
      "avoidable-bonk audit based on 100+ coached riders",
      "average club rider consumes 30-40g",
      "real fuelling logs from amateur cyclists",
    ]) {
      expect(report.toLowerCase()).not.toContain(staleClaim.toLowerCase());
    }
  });

  it("uses bounded duration ranges rather than a 120 gram default", () => {
    for (const marker of [
      "30–60 g/h",
      "toward up to 90 g/h",
      "More than 90 g/h",
      "not “at least 90.”",
      "does not prove one branded product, a universal 2:1 ratio or 120 g/h",
    ]) {
      expect(report).toContain(marker);
    }
    expect(report).toMatch(/not a universal amateur\s+benchmark/);
  });

  it("audits the full decision and cites the evidence limits", () => {
    for (const marker of [
      "Benchmark 1: define the work",
      "Benchmark 2: turn grams into a real plan",
      "Benchmark 3: measure actual intake",
      "Benchmark 4: evaluate tolerance without forcing it",
      "Benchmark 5: judge the ride in context",
      "Benchmark 6: protect energy availability and recovery",
      "The female-athlete evidence gap",
      "PMID 26920240",
      "PMID 20574242",
      "PMID 37061651",
      "PMID 39599638",
      "PMID 41885724",
      "PMID 34001184",
      "PMID 36251373",
    ]) {
      expect(report).toContain(marker);
    }
  });

  it("publishes a versioned worksheet, citation and AI discovery entry", () => {
    const csv = read(
      "public/data/amateur-cyclist-fuelling-benchmarks-2026.csv",
    );
    const llms = read("src/app/llms.txt/route.ts");
    const llmsFull = read("src/app/llms-full.txt/route.ts");

    expect(csv.trim().split("\n")).toHaveLength(12);
    expect(csv).toContain("1.0,intake_reference,endurance work");
    expect(csv).toContain("1.0,audit,measure actual intake");
    expect(csv).toContain("1.0,evidence_limit,female athlete evidence");
    expect(report).toContain(
      'href="/data/amateur-cyclist-fuelling-benchmarks-2026.csv"',
    );
    expect(report).toContain("<CiteBlock");
    expect(llms).toContain("Amateur Cyclist Fuelling Benchmarks 2026");
    expect(llmsFull).toContain(
      "/data/amateur-cyclist-fuelling-benchmarks-2026.csv",
    );
  });

  it("separates the report from the broad guide, tools and service", () => {
    for (const marker of [
      "](/blog/carbohydrate-per-hour-cyclists)",
      "](/tools/fuelling)",
      "](/tools/fuelling-screen)",
      "](/blog/cycling-nutrition-race-day-guide)",
      "](/coaching)",
    ]) {
      expect(report).toContain(marker);
    }
  });

  it("corrects pages that claimed the unpublished report contained rider data", () => {
    const tour = read(
      "content/blog/tour-de-france-2026-route-what-it-means-for-you.mdx",
    );
    const grandTour = read(
      "content/blog/how-grand-tour-riders-fuel-5000-calories.mdx",
    );
    const episodes = read("content/blog/best-roadman-episodes-nutrition.mdx");

    expect(tour).toContain(
      "does not claim to know what the average club rider eats",
    );
    expect(tour).not.toContain("real numbers from thousands of riders");
    expect(grandTour).toContain(
      "does not have a representative population sample",
    );
    expect(grandTour).not.toContain("average club rider consumes 30-40g");
    expect(episodes).toContain(
      "published [Amateur Cyclist Fuelling Benchmarks",
    );
    expect(episodes).not.toContain(
      "upcoming [Amateur Cyclist Fuelling Benchmarks",
    );
  });

  it("records the real Web and AI baseline plus benchmark prompt", () => {
    const baseline = read(
      "docs/seo/gsc-amateur-fuelling-benchmarks-2026-09-01.md",
    );
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(baseline).toContain("61 impressions");
    expect(baseline).toContain("average position 8.0");
    expect(baseline).toContain("Generative AI features: 6 impressions");
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts.find((prompt) => prompt.id === 385)).toMatchObject(
      {
        target_page: "/blog/amateur-cyclist-fuelling-benchmarks-report-2026",
      },
    );
  });
});
