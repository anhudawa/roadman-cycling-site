import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getAllGuestSlugs, getGuestBySlug } from "@/lib/guests";
import { getEpisodeBySlug } from "@/lib/podcast";

const INTERVIEW_SLUGS = [
  "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
  "ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down",
  "ep-2130-how-cycling-can-sabotage-your-weight-loss-and-the-fix",
];

describe("Uri Carlson entity consistency", () => {
  it("consolidates all three interviews into one canonical guest entity", () => {
    const guest = getGuestBySlug("uri-carlson");

    expect(guest).not.toBeNull();
    expect(guest?.name).toBe("Uri Carlson");
    expect(guest?.episodeCount).toBe(3);
    expect(guest?.episodes.map((episode) => episode.slug).sort()).toEqual(
      [...INTERVIEW_SLUGS].sort(),
    );
    expect(getAllGuestSlugs()).not.toContain("yori-carlson");
    expect(getAllGuestSlugs()).not.toContain("yuri-carlson");
  });

  it("normalises known ASR spellings in every rendered interview record", () => {
    for (const slug of INTERVIEW_SLUGS) {
      const episode = getEpisodeBySlug(slug);
      expect(episode).not.toBeNull();
      expect(episode?.guest).toBe("Uri Carlson");
      expect(JSON.stringify(episode)).not.toMatch(/Y(?:o|u)ri Carlson/);
    }
  });

  it("uses the canonical name in the supporting editorial guides", () => {
    for (const file of [
      "content/blog/cycling-nutrition-world-tour-nutritionists.mdx",
      "content/blog/recovery-for-cyclists-world-tour-protocols.mdx",
    ]) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).toContain("Uri Carlson");
      expect(source).not.toMatch(/Y(?:o|u)ri Carlson/);
    }
  });
});
