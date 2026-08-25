import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(marketing)/training-camps/page";

const pageSource = readFileSync(
  "src/app/(marketing)/training-camps/page.tsx",
  "utf8",
);
const promptSource = readFileSync("scripts/ai-benchmark-prompts.json", "utf8");
const gscSource = readFileSync(
  "docs/seo/gsc-training-camps-owner-support-2026-08-25.md",
  "utf8",
);

describe("training camps owner support", () => {
  it("protects the page-one owner metadata", () => {
    expect(metadata.title).toEqual({
      absolute: "Cycling Training Camps in Girona — October 2026",
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/training-camps",
    );
    expect(metadata.description).toContain("from €995");
  });

  it("connects the four decision guides including camp nutrition", () => {
    for (const path of [
      "/blog/what-to-expect-cycling-training-camp",
      "/blog/cycling-training-camp-preparation-guide",
      "/blog/cycling-training-camps-what-to-expect-guide",
      "/blog/cycling-training-camp-nutrition-guide",
    ]) {
      expect(pageSource).toContain(path);
    }
    expect(pageSource).toContain("Plan food, fluids and back-to-back ride days");
  });

  it("links the collection to its canonical Event nodes", () => {
    expect(pageSource).toContain("hasPart: CAMP_LIST.map");
    expect(pageSource).toContain(
      '`https://roadmancycling.com${camp.href}#event`',
    );
    expect(pageSource).toContain('"@type": "Event"');
  });

  it("names the people accountable for camp review", () => {
    expect(pageSource).toContain(
      "Anthony Walsh (camp lead), Sarah Ann Egan (operations), and Matthew Devins (coaching and support)",
    );
    expect(pageSource).not.toContain(
      'reviewedBy="Roadman Cycling operations and coaching team"',
    );
  });

  it("records the GSC baseline and extends AI measurement", () => {
    expect(gscSource).toContain("| 24 | 669 | 3.6% | 7.8 |");
    expect(gscSource).toContain("cycling training camps 2026 | 0 | 15");

    const prompts = JSON.parse(promptSource) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 220,
        target_page: "/training-camps",
        prompt:
          "cycling training camps 2026 in Girona with coaching and follow car",
      }),
    );
  });
});
