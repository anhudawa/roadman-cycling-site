import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { TOUR_STAGES } from "@/data/tour-de-france-2026";
import {
  gcStandings,
  lastUpdatedAfterStage,
  latestStageResult,
} from "@/data/tour-results-2026";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH = "/tour-de-france/stage/18";

describe("Tour de France 2026 stage 18 result owner", () => {
  it("stores the verified winner, podium and race story", () => {
    const stage = TOUR_STAGES.find((candidate) => candidate.number === 18);

    expect(stage?.result).toEqual(
      expect.objectContaining({
        winner: "Richard Carapaz",
        winnerTeam: "EF Education-EasyPost",
        winningTime: "4:26:21",
        lastReviewed: "2026-08-26",
      }),
    );
    expect(stage?.result?.podium).toEqual([
      expect.objectContaining({ position: 1, rider: "Richard Carapaz" }),
      expect.objectContaining({
        position: 2,
        rider: "Mauro Schmid",
        timeOrGap: "+0:45",
      }),
      expect.objectContaining({
        position: 3,
        rider: "Matteo Jorgenson",
        timeOrGap: "+0:45",
      }),
    ]);
    expect(stage?.result?.keyMoments).toHaveLength(5);
    expect(stage?.result?.sources).toHaveLength(4);
    expect(stage?.description).not.toContain("begin in earnest");
  });

  it("renders result intent and completed-event answer schema", () => {
    const page = read("src/app/tour-de-france/stage/[number]/page.tsx");

    for (const signal of [
      "Tour de France 2026 Stage",
      "Results:",
      "STAGE {stage.number} RESULT",
      "HOW THE RACE WAS WON",
      "OFFICIAL SOURCES",
      "https://schema.org/EventCompleted",
      '"@type": "FAQPage"',
    ]) {
      expect(page).toContain(signal);
    }
    expect(page).toContain("{!result && (");
    expect(page).toContain("The official result and report");
  });

  it("brings the Tour result feed to the official final classification", () => {
    expect(lastUpdatedAfterStage).toBe(21);
    expect(latestStageResult?.stageNumber).toBe(21);
    expect(latestStageResult?.topThree.map((rider) => rider.name)).toEqual([
      "Mathieu van der Poel",
      "Jasper Philipsen",
      "Mads Pedersen",
    ]);
    expect(gcStandings).toHaveLength(10);
    expect(gcStandings.slice(0, 5)).toEqual([
      expect.objectContaining({
        position: 1,
        name: "Tadej Pogačar",
        gapSeconds: 0,
      }),
      expect.objectContaining({
        position: 2,
        name: "Remco Evenepoel",
        gapSeconds: 386,
      }),
      expect.objectContaining({
        position: 3,
        name: "Isaac del Toro",
        gapSeconds: 582,
      }),
      expect.objectContaining({
        position: 4,
        name: "Paul Seixas",
        gapSeconds: 716,
      }),
      expect.objectContaining({
        position: 5,
        name: "Lenny Martinez",
        gapSeconds: 782,
      }),
    ]);
  });

  it("records the baseline and aligns discovery and recrawl", () => {
    const decision = read(
      "docs/seo/gsc-tour-stage-18-results-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "19",
      "2,283",
      "0.8%",
      "8.3",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Tour de France 2026 stage 18 result",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(OWNER_PATH);
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER_PATH);

    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain("s.result?.lastReviewed");

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 278,
        target_page: OWNER_PATH,
        prompt:
          "who won stage 18 of the 2026 Tour de France and how did the race unfold",
      }),
    );
  });
});
