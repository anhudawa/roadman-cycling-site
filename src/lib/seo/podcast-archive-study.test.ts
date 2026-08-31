import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PODCAST_ARCHIVE_BY_YEAR,
  PODCAST_ARCHIVE_FORMATS,
  PODCAST_ARCHIVE_PILLARS,
  PODCAST_ARCHIVE_REPORT,
} from "@/data/podcast-archive-study";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const sum = <T>(rows: readonly T[], field: keyof T) =>
  rows.reduce((total, row) => total + Number(row[field]), 0);

describe("cycling podcast archive study", () => {
  it("reconciles every frozen aggregate to 818 episode records", () => {
    expect(sum(PODCAST_ARCHIVE_BY_YEAR, "episodes")).toBe(
      PODCAST_ARCHIVE_REPORT.episodeCount,
    );
    expect(sum(PODCAST_ARCHIVE_PILLARS, "episodes")).toBe(
      PODCAST_ARCHIVE_REPORT.episodeCount,
    );
    expect(sum(PODCAST_ARCHIVE_FORMATS, "episodes")).toBe(
      PODCAST_ARCHIVE_REPORT.episodeCount,
    );
    expect(sum(PODCAST_ARCHIVE_BY_YEAR, "inlineTranscript")).toBe(
      PODCAST_ARCHIVE_REPORT.inlineTranscriptCount,
    );
    expect(sum(PODCAST_ARCHIVE_BY_YEAR, "dedicatedTranscript")).toBe(
      PODCAST_ARCHIVE_REPORT.dedicatedTranscriptCount,
    );
    expect(sum(PODCAST_ARCHIVE_BY_YEAR, "youtube")).toBe(
      PODCAST_ARCHIVE_REPORT.youtubeCount,
    );
    expect(sum(PODCAST_ARCHIVE_BY_YEAR, "audio")).toBe(
      PODCAST_ARCHIVE_REPORT.audioFileCount,
    );

    for (const row of PODCAST_ARCHIVE_BY_YEAR) {
      expect(
        row.community +
          row.coaching +
          row.nutrition +
          row.recovery +
          row.strength,
        `${row.year} pillars`,
      ).toBe(row.episodes);
      expect(
        row.interview + row.solo + row.panel + row.sarahAnthony + row.vlog,
        `${row.year} formats`,
      ).toBe(row.episodes);
    }
  });

  it("keeps the downloadable CSV aligned with the frozen yearly table", () => {
    const csv = read("public/data/roadman-podcast-archive-2026.csv")
      .trim()
      .split("\n");
    expect(csv[0]).toBe(
      "year,episodes,community,coaching,nutrition,recovery,strength,interview,solo,panel,sarah_anthony,vlog,inline_transcript,dedicated_transcript,youtube,audio",
    );
    expect(csv).toHaveLength(PODCAST_ARCHIVE_BY_YEAR.length + 1);

    for (const [index, row] of PODCAST_ARCHIVE_BY_YEAR.entries()) {
      expect(csv[index + 1]).toBe(
        [
          row.year,
          row.episodes,
          row.community,
          row.coaching,
          row.nutrition,
          row.recovery,
          row.strength,
          row.interview,
          row.solo,
          row.panel,
          row.sarahAnthony,
          row.vlog,
          row.inlineTranscript,
          row.dedicatedTranscript,
          row.youtube,
          row.audio,
        ].join(","),
      );
    }
  });

  it("publishes Dataset schema, a visible method and correction boundary", () => {
    const page = read(
      "src/app/(content)/research/cycling-podcast-archive-study/page.tsx",
    );

    for (const marker of [
      '"@type": "Dataset"',
      '"@type": "DataDownload"',
      "CC BY 4.0",
      "HOW TO REPRODUCE",
      "This is first-party archive metadata, not a listening study",
      "/author/anthony-walsh",
      "/about/corrections",
      "/data/roadman-podcast-archive-2026.csv",
      "/feeds/podcast-archive-study.json",
    ]) {
      expect(page).toContain(marker);
    }
    expect(page).not.toContain("global cycling podcast market share");
  });

  it("connects the report to crawl, AI discovery and relevant public owners", () => {
    const route = "/research/cycling-podcast-archive-study";
    for (const path of [
      "src/app/sitemap.ts",
      "scripts/submit-indexnow.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/feeds/podcast-archive-study.json/route.ts",
      "src/app/(content)/podcast/page.tsx",
      "src/app/(content)/research/page.tsx",
      "src/app/(marketing)/about/press/page.tsx",
    ]) {
      expect(read(path), path).toContain(route);
    }
  });

  it("adds three measurable research prompts and an approval-gated press pack", () => {
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(
      benchmark.prompts.filter((prompt) => prompt.id >= 344),
    ).toMatchObject(
      [344, 345, 346].map((id) => ({
        id,
        target_page: "/research/cycling-podcast-archive-study",
      })),
    );

    const distribution = read(
      "docs/seo/podcast-archive-study-distribution-2026-08-31.md",
    );
    for (const outlet of [
      "Cycling Weekly",
      "Podnews",
      "Rouleur",
      "Cyclingnews",
      "Cyclist",
      "BikeRadar",
      "Escape Collective",
    ]) {
      expect(distribution).toContain(outlet);
    }
    expect(distribution).toContain("without Roadman owner approval");
    expect(distribution).toContain("never BCC this list");
  });
});
