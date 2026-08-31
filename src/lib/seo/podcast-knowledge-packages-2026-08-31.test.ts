import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

type Chapter = { timestamp: string; title: string };

const PACKAGES = [
  {
    slug: "ep-24-i-asked-a-40-year-old-amateur-how-he-beat-pogacar",
    guest: "Andrew Feather",
    minimumChapters: 10,
    guestPath: "/guests/andrew-feather",
  },
  {
    slug: "ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
    guest: "Daryl Fitzgerald",
    minimumChapters: 12,
    guestPath: "/guests/daryl-fitzgerald",
  },
] as const;

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

function toSeconds(value: string): number {
  return value
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

describe("31 August podcast knowledge packages", () => {
  it.each(PACKAGES)(
    "keeps $slug as a complete transcript, guest and watch package",
    ({ slug, guest, minimumChapters, guestPath }) => {
      const source = read(`content/podcast/${slug}.mdx`);
      const episode = matter(source).data as {
        updatedDate: string;
        duration: string;
        youtubeId: string;
        transcript: string;
        answerCapsule: string;
        chapters: Chapter[];
        guest: string;
        guestBio: string;
        claims: Array<{ reviewed?: boolean }>;
        citations: Array<{ reviewed?: boolean }>;
      };
      const offsets = episode.chapters.map((chapter) =>
        toSeconds(chapter.timestamp),
      );

      expect(episode.updatedDate).toBe("2026-08-31");
      expect(episode.youtubeId).toBeTruthy();
      expect(episode.transcript.length).toBeGreaterThan(5_000);
      expect(episode.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(60);
      expect(episode.guest).toBe(guest);
      expect(episode.guestBio.length).toBeGreaterThan(150);
      expect(episode.chapters.length).toBeGreaterThanOrEqual(minimumChapters);
      expect(offsets[0]).toBe(0);
      expect(offsets.at(-1)).toBeLessThan(toSeconds(episode.duration));
      expect(
        offsets.every(
          (offset, index) => index === 0 || offset > offsets[index - 1],
        ),
      ).toBe(true);
      expect(new Set(episode.chapters.map((chapter) => chapter.title)).size).toBe(
        episode.chapters.length,
      );
      expect(episode.claims.every((claim) => claim.reviewed === true)).toBe(true);
      expect(episode.citations.every((citation) => citation.reviewed === true)).toBe(
        true,
      );
      expect(source).toContain(`[guest profile](${guestPath})`);
      expect(source).toContain("[Roadman Cycling Podcast archive](/podcast)");
    },
  );

  it("keeps one episode route, one transcript route and one watch route per package", () => {
    const podcastPage = read("src/app/(content)/podcast/[slug]/page.tsx");
    const watchPage = read("src/app/(content)/watch/[slug]/page.tsx");
    const sitemap = read("src/app/sitemap.ts");

    expect(podcastPage).toContain('href={`/watch/${episode.slug}`}');
    expect(podcastPage).toContain('href={`/podcast/${slug}/transcript`}');
    expect(watchPage).toContain('href={`/podcast/${slug}`}');
    expect(sitemap).toContain("const watchEntries");
    expect(sitemap).toContain("const transcriptEntries");
  });

  it("records the demand-led choice and reusable media briefs", () => {
    const brief = read(
      "docs/seo/podcast-knowledge-packages-2026-08-31.md",
    ).toLowerCase();

    for (const signal of [
      "2,729 exact-query impressions",
      "2,892 page impressions",
      "clip brief",
      "newsletter brief",
      "social brief",
      "follow-on article brief",
    ]) {
      expect(brief).toContain(signal);
    }
  });
});
