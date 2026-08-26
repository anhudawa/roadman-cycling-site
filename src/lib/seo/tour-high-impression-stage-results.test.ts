import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { TOUR_STAGES } from "@/data/tour-de-france-2026";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const EXPECTED_RESULTS = [
  {
    stage: 1,
    winner: "Jonas Vingegaard",
    winningTime: "21:47",
    podium: ["Jonas Vingegaard", "Filippo Ganna", "Tadej Pogačar"],
  },
  {
    stage: 11,
    winner: "Søren Wærenskjold",
    winningTime: "3:10:06",
    podium: ["Søren Wærenskjold", "Olav Kooij", "Jasper Philipsen"],
  },
  {
    stage: 13,
    winner: "Mauro Schmid",
    winningTime: "4:06:58",
    podium: ["Mauro Schmid", "Harold Tejada", "Tom Pidcock"],
  },
  {
    stage: 14,
    winner: "Tadej Pogačar",
    winningTime: "4:00:07",
    podium: ["Tadej Pogačar", "Isaac del Toro", "Paul Seixas"],
  },
] as const;

describe("high-impression Tour stage result owners", () => {
  it.each(EXPECTED_RESULTS)(
    "stores the verified stage $stage result",
    ({ stage: number, winner, winningTime, podium }) => {
      const stage = TOUR_STAGES.find(
        (candidate) => candidate.number === number,
      );

      expect(stage?.result).toEqual(
        expect.objectContaining({
          winner,
          winningTime,
          lastReviewed: "2026-08-26",
        }),
      );
      expect(stage?.result?.podium.map((rider) => rider.rider)).toEqual(podium);
      expect(stage?.result?.keyMoments).toHaveLength(5);
      expect(stage?.result?.sources).toHaveLength(3);
      expect(
        stage?.result?.sources.every((source) =>
          source.href.includes("letour.fr"),
        ),
      ).toBe(true);
    },
  );

  it("uses the shared answer-first result rendering and completed schema", () => {
    const page = read("src/app/tour-de-france/stage/[number]/page.tsx");

    for (const signal of [
      "Results:",
      "STAGE {stage.number} RESULT",
      "HOW THE RACE WAS WON",
      "OFFICIAL SOURCES",
      '"@type": "FAQPage"',
      "https://schema.org/EventCompleted",
      "{!result && (",
    ]) {
      expect(page).toContain(signal);
    }
  });

  it("records the GSC baseline and extends discovery controls", () => {
    const decision = read(
      "docs/seo/gsc-tour-high-impression-stage-results-2026-08-26.md",
    );
    for (const signal of [
      "1,048",
      "778",
      "705",
      "689",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    const llms = read("src/app/llms.txt/route.ts");
    const llmsFull = read("src/app/llms-full.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const sitemap = read("src/app/sitemap.ts");

    for (const stage of [1, 11, 13, 14]) {
      const path = `/tour-de-france/stage/${stage}`;
      expect(llms).toContain(path);
      expect(llmsFull).toContain(path);
      expect(indexNow).toContain(path);
    }
    expect(sitemap).toContain("s.result?.lastReviewed");

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    for (const [id, stage] of [
      [280, 1],
      [281, 11],
      [282, 13],
      [283, 14],
    ]) {
      expect(prompts.prompts).toContainEqual(
        expect.objectContaining({
          id,
          target_page: `/tour-de-france/stage/${stage}`,
        }),
      );
    }
  });
});
