import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { gcStandings, tourFinalResult } from "@/data/tour-results-2026";

const RETIRED_SLUG = "tour-de-france-2026-complete-guide";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Tour de France 2026 final-results owner", () => {
  const page = read("src/app/tour-de-france/page.tsx");
  const config = read("next.config.ts");

  it("publishes one answer-first, self-canonical final result page", () => {
    expect(page).toContain(
      'title: "Tour de France 2026 Results: Winner, Final GC & Stages"',
    );
    expect(page).toContain("alternates: { canonical: URL }");
    expect(page).toContain("2026 TOUR DE FRANCE FINAL RESULTS");
    expect(page).toContain("OFFICIAL RESULT · REVIEWED");
    expect(page).toContain('"@type": "FAQPage"');
    expect(page).toContain("Who won the 2026 Tour de France?");
    expect(page).toContain(
      'href="/blog/tour-de-france-2026-route-what-it-means-for-you"',
    );
    expect(page).toContain(
      'href="/blog/tdf-2026-contenders-preparation-lessons"',
    );
  });

  it("uses the source-reviewed final race record", () => {
    expect(tourFinalResult).toMatchObject({
      winner: "Tadej Pogačar",
      winnerTeam: "UAE Team Emirates–XRG",
      winningTime: "73:56:26",
      winningMargin: "6:26",
      titleCount: 5,
      officialDistanceKm: 3197,
      lastReviewed: "2026-08-26",
    });
    expect(tourFinalResult.podium.map((rider) => rider.name)).toEqual([
      "Tadej Pogačar",
      "Remco Evenepoel",
      "Isaac del Toro",
    ]);
    expect(gcStandings).toHaveLength(10);
    expect(tourFinalResult.classificationWinners).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ winner: "Mads Pedersen" }),
        expect.objectContaining({ winner: "Richard Carapaz" }),
        expect.objectContaining({ winner: "Isaac del Toro" }),
      ]),
    );
    expect(
      tourFinalResult.sources.every((source) =>
        source.href.includes("letour.fr"),
      ),
    ).toBe(true);
  });

  it("marks the race and its stages completed in SportsEvent data", () => {
    expect(page).toContain('eventStatus: "https://schema.org/EventCompleted"');
    expect(page).toContain("endDate: TOUR_META.endDate");
    expect(page).toContain("endDate: s.date");
    expect(page).not.toContain(
      'eventStatus: "https://schema.org/EventScheduled"',
    );
  });

  it("permanently consolidates the stale complete guide and removes it from discovery", () => {
    const redirectAt = config.indexOf(`source: "/blog/${RETIRED_SLUG}"`);
    expect(redirectAt).toBeGreaterThan(-1);
    expect(config.slice(redirectAt, redirectAt + 220)).toContain(
      'destination: "/tour-de-france"',
    );
    expect(config.slice(redirectAt, redirectAt + 220)).toContain(
      "permanent: true",
    );
    expect(getAllPosts().some((post) => post.slug === RETIRED_SLUG)).toBe(
      false,
    );
    expect(getPostBySlug(RETIRED_SLUG)).toBeNull();

    const blogCorpus = readdirSync(resolve(process.cwd(), "content/blog"))
      .filter((filename) => filename.endsWith(".mdx"))
      .map((filename) => read(`content/blog/${filename}`))
      .join("\n");
    expect(blogCorpus).not.toContain(`/blog/${RETIRED_SLUG}`);
    expect(blogCorpus).not.toContain(`- ${RETIRED_SLUG}`);
  });

  it("extends crawler, AI-answer and measurement controls", () => {
    const llms = read("src/app/llms.txt/route.ts");
    const llmsFull = read("src/app/llms-full.txt/route.ts");
    const sitemap = read("src/app/sitemap.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(llms).toContain("Tour de France 2026 final results");
    expect(llmsFull).toContain("Canonical final-result owner");
    expect(sitemap).toContain(
      '/tour-de-france`, lastModified: new Date("2026-08-26")',
    );
    expect(indexNow).toContain("`https://${HOST}/tour-de-france`");
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 279, target_page: "/tour-de-france" }),
    );
  });
});
