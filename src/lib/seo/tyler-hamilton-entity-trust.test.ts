import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH = "/guests/tyler-hamilton";
const MAIN_EPISODE =
  "ep-2152-hamiltons-untold-account-of-doping-forgiving-lance";

describe("Tyler Hamilton entity and CTR owner", () => {
  it("turns the established guest owner into a current, source-bounded answer", () => {
    const profiles = read("src/lib/guests/profiles.ts");

    expect(profiles).toContain(
      'seoTitle: "Tyler Hamilton: Career, Doping & Podcast"',
    );
    expect(profiles).toContain("https://www.wikidata.org/wiki/Q505446");
    expect(profiles).toContain("https://www.tylerhamiltontraining.com/about");
    expect(profiles).toContain("voluntarily returned it");
    expect(profiles).toContain("homologous blood transfusion");
    expect(profiles).toContain('lastReviewed: "2026-08-26"');

    const entity = matter(read("content/entities/tyler-hamilton.mdx"));
    expect(entity.data.jobTitle).not.toContain("Olympic gold");
    expect(entity.content).toContain("voluntarily returned the medal");

    const registry = read("src/data/canonical-entities.ts");
    expect(registry).toContain('affiliation: "Tyler Hamilton Training"');
    expect(registry).toContain('guestSlug: "tyler-hamilton"');
    expect(registry).toContain(
      '"tyler-hamilton-the-evolution-of-coaching"',
    );
  });

  it("cleans surfaced quotations and corrects supporting identity copy", () => {
    const episode = matter(read(`content/podcast/${MAIN_EPISODE}.mdx`));
    const earlierEpisode = matter(
      read("content/podcast/tyler-hamilton-forgiveness-and-rebirth.mdx"),
    );

    expect(episode.data.updatedDate).toBe("2026-08-26");
    expect(episode.data.keyQuotes[0].text).toContain("committee meetings");
    expect(episode.data.keyQuotes[0].text).not.toContain("Petri petrified");
    expect(episode.data.keyQuotes[2].text).not.toContain("he he");
    expect(earlierEpisode.data.guestCredentials).not.toContain("gold medalist");
    expect(earlierEpisode.content).toContain(
      "He later returned the medal and asked the IOC",
    );

    expect(read("src/lib/guests.ts")).not.toContain(
      '"Tyler Hamilton": "Olympic time-trial champion',
    );
    expect(read("content/blog/cycling-podcast-guest-directory.mdx")).not.toContain(
      "Tyler Hamilton](/guests/tyler-hamilton)** — Olympic time-trial champion",
    );

    const expertPage = read("src/app/(content)/experts/[expertSlug]/page.tsx");
    expect(expertPage).toContain(
      "title: `What Does ${guest.name} Say? — Topics`",
    );
    expect(expertPage).toContain(
      "Explore direct quotes, key positions and Roadman podcast episodes by topic.",
    );
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain("getGuestProfileOverride");
    expect(sitemap).toContain(
      "latestValidDate(guest.latestAppearance, profileReviewed)",
    );
  });

  it("records the baseline and extends AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-tyler-hamilton-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("8 clicks");
    expect(decision).toContain("6,783 impressions");
    expect(decision).toContain("0.1% CTR");
    expect(decision).toContain("Average position 11.7");
    expect(decision).toContain("6,474");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Tyler Hamilton: Career, Doping Record and Roadman Podcast Profile",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/experts/tyler-hamilton",
      `/podcast/${MAIN_EPISODE}`,
      "/podcast/tyler-hamilton-forgiveness-and-rebirth",
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
        id: 229,
        target_page: OWNER_PATH,
        prompt:
          "who is Tyler Hamilton and why did he return his Olympic gold medal",
      }),
    );
  });
});
