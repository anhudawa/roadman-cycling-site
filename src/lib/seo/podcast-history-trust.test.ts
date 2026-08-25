import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GET as getFacts } from "@/app/api/facts.json/route";
import { BRAND, PODCAST, PODCAST_HISTORY } from "@/lib/brand-facts";

const TRUST_SURFACES = [
  "src/app/(content)/podcast/page.tsx",
  "src/app/(marketing)/about/page.tsx",
  "src/app/(marketing)/about/press/page.tsx",
  "src/app/(marketing)/entity/roadman-cycling/page.tsx",
  "src/app/(marketing)/entity/roadman-podcast/page.tsx",
  "src/app/(marketing)/facts/page.tsx",
  "src/app/(marketing)/masters/page.tsx",
  "src/app/llms.txt/route.ts",
  "src/app/llms-full.txt/route.ts",
  "src/components/seo/JsonLd.tsx",
] as const;

describe("podcast entity history", () => {
  it("distinguishes feed continuity from the Roadman brand rebrand", () => {
    expect(PODCAST_HISTORY.feedStartedDate).toBe("2017-03-31");
    expect(PODCAST_HISTORY.feedStartedYear).toBe(2017);
    expect(PODCAST_HISTORY.roadmanBrandSinceYear).toBe(BRAND.foundedYear);
    expect(PODCAST_HISTORY.roadmanBrandSinceYear).toBe(2021);
    expect(PODCAST_HISTORY.summary).toContain("active since 2017");
    expect(PODCAST_HISTORY.summary).toContain("2021 rebrand");
    expect(PODCAST_HISTORY.evidenceUrls).toContain(PODCAST.appleUrl);
    expect(PODCAST_HISTORY.evidenceUrls).toContain(
      "https://www.podchaser.com/podcasts/the-roadman-cycling-podcast-516594",
    );
  });

  it("exposes the sourced history through the public facts API", async () => {
    const response = await getFacts();
    const facts = (await response.json()) as {
      podcastHistory: {
        feedStartedDate: string;
        feedStartedYear: string;
        roadmanBrandSinceYear: string;
        summary: string;
        evidenceUrls: string[];
      };
    };

    expect(facts.podcastHistory).toEqual({
      feedStartedDate: PODCAST_HISTORY.feedStartedDate,
      feedStartedYear: String(PODCAST_HISTORY.feedStartedYear),
      roadmanBrandSinceYear: String(PODCAST_HISTORY.roadmanBrandSinceYear),
      summary: PODCAST_HISTORY.summary,
      evidenceUrls: [...PODCAST_HISTORY.evidenceUrls],
    });
  });

  it("keeps human, schema and AI trust surfaces on the shared fact", () => {
    const sources = TRUST_SURFACES.map((path) =>
      readFileSync(resolve(process.cwd(), path), "utf8"),
    );
    const combined = sources.join("\n");

    expect(combined).not.toMatch(/weekly since 2021/i);
    expect(combined).not.toMatch(/recorded weekly since 2021/i);
    expect(combined).not.toMatch(/For four years Roadman/i);
    expect(combined).not.toMatch(
      /world(?:'|&apos;)s largest cycling performance podcast/i,
    );
    expect(combined).toContain("PODCAST_HISTORY.summary");
    expect(
      combined.match(/datePublished: PODCAST_HISTORY\.feedStartedDate/g),
    ).toHaveLength(3);
  });
});
