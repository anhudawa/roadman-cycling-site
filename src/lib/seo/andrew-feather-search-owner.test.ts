import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const OWNER_SLUG =
  "ep-24-i-asked-a-40-year-old-amateur-how-he-beat-pogacar";
const OWNER_PATH = `/podcast/${OWNER_SLUG}`;
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Andrew Feather episode search owner", () => {
  it("keeps the established URL and explains the pursuit result accurately", () => {
    const episode = matter(read(`content/podcast/${OWNER_SLUG}.mdx`));

    expect(episode.data.seoTitle).toBe(
      "Andrew Feather: Pogi Challenge Power & Hill Climbs",
    );
    expect(episode.data.updatedDate).toBe("2026-08-31");
    expect(episode.data.answerCapsule).toContain("head start");
    expect(episode.data.answerCapsule).toContain(
      "elapsed climb time was about three and a half minutes faster",
    );
    expect(episode.data.answerCapsule).toContain("self-reported");
    expect(episode.content).toContain("Verified record and source boundary");
    expect(episode.data.citations).toHaveLength(7);
    expect(episode.data.faq).toHaveLength(5);
  });

  it("separates official records from first-person power and training figures", () => {
    const episode = matter(read(`content/podcast/${OWNER_SLUG}.mdx`));
    const profile = read("src/lib/guests/profiles.ts");

    expect(episode.data.claims[0].evidence).toBe("anecdote");
    expect(episode.data.keyTakeaways[0]).toContain(
      "not independently verified",
    );
    expect(episode.data.keyQuotes[0].text).toBe("I did 397 W.");
    expect(profile).toContain("four-time UK National Hill-Climb Champion");
    expect(profile).toContain('lastReviewed: "2026-08-26"');
    expect(profile).toContain("first-across-the-line result");
    expect(profile).not.toContain("2024 Pogi Challenge");
  });

  it("differentiates support-page intent and removes the fabricated Strava story", () => {
    const expertPage = read(
      "src/app/(content)/experts/[expertSlug]/page.tsx",
    );
    const profile = read("src/lib/guests/profiles.ts");
    const climbGuide = read(
      "content/blog/climb-faster-cycling-five-fixable-reasons.mdx",
    );
    const timeGuide = read(
      "content/blog/cycling-climbing-time-estimate-guide.mdx",
    );

    expect(expertPage).toContain("override?.expertSeoTitle");
    expect(profile).toContain(
      'expertSeoTitle: "Andrew Feather on Hill-Climb Training & Pacing"',
    );
    for (const source of [climbGuide, timeGuide]) {
      expect(source).not.toContain("same conditions");
      expect(source).not.toContain("beat Pogacar on a Strava segment");
      expect(source).toContain("faster elapsed");
    }
  });

  it("records the GSC baseline and extends discovery measurement", () => {
    const decision = read(
      "docs/seo/gsc-andrew-feather-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("68 clicks");
    expect(decision).toContain("3,698 impressions");
    expect(decision).toContain("1.8% CTR");
    expect(decision).toContain("Average position 8.0");
    expect(decision).toContain("2,729");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Andrew Feather: Pogi Challenge Power and Hill Climbs",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/guests/andrew-feather",
      "/experts/andrew-feather",
      "/blog/climb-faster-cycling-five-fixable-reasons",
      "/blog/cycling-climbing-time-estimate-guide",
    ]) {
      expect(indexNow).toContain(path);
    }

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 234,
        target_page: OWNER_PATH,
        prompt:
          "who is Andrew Feather and did he beat Tadej Pogacar at the Pogi Challenge",
      }),
    );
  });
});
