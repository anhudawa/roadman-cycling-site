import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "benji-naesen-imposter-syndrome-cycling-weight-loss";
const RETIRED = "benji-naesen-imposter-syndrome-weight-loss-creators";
const EPISODE =
  "ep-2230-benji-naesens-opens-up-about-imposter-syndrome-in-cycling";

describe("Benji Naesen entity and CTR consolidation", () => {
  it("preserves the established search owner and retires the duplicate", () => {
    const config = read("next.config.ts");
    const source = `source:\n          \"/blog/${RETIRED}\"`;
    const index = config.indexOf(source);

    expect(index).toBeGreaterThan(-1);
    expect(config.slice(index, index + 320)).toContain(
      `\"/blog/${OWNER}\"`,
    );
    expect(config.slice(index, index + 320)).toContain("permanent: true");
    expect(
      existsSync(resolve(process.cwd(), `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);
  });

  it("makes the article a current, source-bounded entity answer", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe("Benji Naesen: Lanterne Rouge Interview");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("first-person transcript verification");
    expect(data.keywords).toEqual(
      expect.arrayContaining(["benji naesen", "who is benji naesen"]),
    );
    expect(data.relatedEpisodes).toContain(EPISODE);
    expect(data.citedClaims).toHaveLength(4);
    expect(data.citedClaims[0].evidenceLevel).toBeUndefined();
    expect(
      data.citedClaims
        .slice(1)
        .every(
          (claim: { evidenceLevel: string }) =>
            claim.evidenceLevel === "anecdotal",
        ),
    ).toBe(true);
    expect(content).toContain("Benji Naesen is a Belgian cycling podcaster");
    expect(content).toContain(
      "It does not establish the ideal rate of weight loss for another cyclist",
    );
    expect(raw).not.toContain(RETIRED);

    for (const unsupported of [
      "Most riders who lose weight quickly regain it within 18 months",
      "trigger hormonal resistance",
      "holds power output steady while the weight comes down",
    ]) {
      expect(raw).not.toContain(unsupported);
    }
  });

  it("connects a verified Person profile to the article and source episode", () => {
    const profiles = read("src/lib/guests/profiles.ts");
    const guestPage = read("src/app/(content)/guests/[slug]/page.tsx");
    const episode = matter(read(`content/podcast/${EPISODE}.mdx`)).data;

    expect(profiles).toContain('"benji-naesen": {');
    expect(profiles).toContain("https://www.youtube.com/@BenjiNaesenTV");
    expect(profiles).toContain("https://www.instagram.com/benjinaesen/");
    expect(profiles).toContain("https://x.com/BenjiNaesen");
    expect(profiles).toContain(`\"${OWNER}\"`);
    expect(guestPage).toContain("override?.seoTitle");
    expect(episode.title).toBe(
      "Benji Naesen Opens Up About Imposter Syndrome in Cycling",
    );
    expect(episode.updatedDate).toBe("2026-08-25");
    expect(episode.citations.filter((citation: { reviewed: boolean }) => citation.reviewed))
      .toHaveLength(2);
  });

  it("records the baseline and extends IndexNow and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-benji-naesen-consolidation-2026-08-25.md",
    );
    expect(decision).toContain(
      "107 clicks, 14,919 impressions, 0.7%\nCTR and average position 7.2",
    );
    expect(decision).toContain("14,901");
    expect(decision).toContain("earliest reliable\n  review **3 September 2026**");
    expect(decision).toContain("earliest reliable review **24 September 2026**");

    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      `/blog/${OWNER}`,
      "/guests/benji-naesen",
      `/podcast/${EPISODE}`,
    ]) {
      expect(indexNow).toContain(path);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 225,
        target_page: `/blog/${OWNER}`,
        prompt:
          "who is Benji Naesen and what is his role on the Lanterne Rouge Cycling Podcast",
      }),
    );
  });
});
