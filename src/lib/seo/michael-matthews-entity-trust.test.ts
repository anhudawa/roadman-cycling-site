import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { getEntityBySlug, getEntityProfilePath } from "@/lib/entities";
import { getGuestBySlug } from "@/lib/guests";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH = "/guests/michael-matthews";
const MAIN_EPISODE =
  "ep-4-15-years-of-pro-riding-what-amateurs-don-t-know-matthews";
const EARLIER_EPISODE = "bling-matthews-the-hunt-for-green-jerseys";

describe("Michael Matthews entity and CTR owner", () => {
  it("turns the guest owner into a current, source-bounded identity answer", () => {
    const profiles = read("src/lib/guests/profiles.ts");

    expect(profiles).toContain(
      'seoTitle: "Michael Matthews: Cyclist, Tour Wins & Podcast"',
    );
    expect(profiles).toContain("https://www.wikidata.org/wiki/Q561546");
    expect(profiles).toContain("contract runs through the end of 2027");
    expect(profiles).toContain(
      "Counts can differ when team time trials are included",
    );
    expect(profiles).toContain('lastReviewed: "2026-08-26"');

    const entity = getEntityBySlug("michael-matthews");
    expect(entity).not.toBeNull();
    expect(entity?.canonicalProfilePath).toBe(OWNER_PATH);
    expect(getEntityProfilePath(entity!)).toBe(OWNER_PATH);
    expect(entity?.nationality).toBe("Australia");
    expect(entity?.sources).toHaveLength(6);
  });

  it("consolidates the duplicate Person and sitemap signals on the owner", () => {
    const entityPage = read("src/app/(marketing)/entity/[slug]/page.tsx");
    const sitemap = read("src/app/sitemap.ts");
    const featuredExperts = read(
      "src/components/features/blog/FeaturedExperts.tsx",
    );
    const blogPage = read("src/app/(content)/blog/[slug]/page.tsx");

    expect(entityPage).toContain(
      "permanentRedirect(entity.canonicalProfilePath)",
    );
    expect(sitemap).toContain("filter((e) => !e.canonicalProfilePath)");
    expect(featuredExperts).toContain("href={getEntityProfilePath(e)}");
    expect(blogPage).toContain(
      "const profilePath = getEntityProfilePath(entity)",
    );
    expect(blogPage).toContain('"@id": `${SITE_ORIGIN}${profilePath}#person`');
  });

  it("attaches both interviews and keeps the training claims transcript-faithful", () => {
    const current = matter(read(`content/podcast/${MAIN_EPISODE}.mdx`));
    const earlier = matter(read(`content/podcast/${EARLIER_EPISODE}.mdx`));
    const article = matter(
      read("content/blog/michael-matthews-no-base-miles-pro-training.mdx"),
    );

    expect(current.data.updatedDate).toBe("2026-08-26");
    expect(current.data.keyTakeaways[1]).toContain("underdone for the race");
    expect(current.data.claims[1].claim).not.toContain("cost him top-end");
    expect(current.data.keyQuotes[0].text).not.toContain(
      "I don't really That's",
    );
    expect(current.data.keyQuotes[1].text).toContain("with COVID");
    expect(earlier.data.guest).toBe("Michael Matthews");
    expect(earlier.data.updatedDate).toBe("2026-08-26");
    expect(getGuestBySlug("michael-matthews")?.episodeCount).toBe(2);
    expect(article.data.seoDescription).toContain("high-200s to low-300s");
    expect(article.content).toContain("coach Brian Stephens");
  });

  it("records the baseline and extends AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-michael-matthews-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("10 clicks");
    expect(decision).toContain("3,509 impressions");
    expect(decision).toContain("0.3% CTR");
    expect(decision).toContain("Average position 11.8");
    expect(decision).toContain("2,770");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Michael Matthews: Cyclist, Tour Wins and Roadman Podcast Profile",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/entity/michael-matthews",
      "/experts/michael-matthews",
      "/blog/michael-matthews-no-base-miles-pro-training",
      `/podcast/${MAIN_EPISODE}`,
      `/podcast/${EARLIER_EPISODE}`,
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
        id: 270,
        target_page: OWNER_PATH,
        prompt: "who is Michael Matthews cyclist and what has he won",
      }),
    );
  });
});
