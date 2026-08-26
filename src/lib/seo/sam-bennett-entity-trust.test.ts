import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import { getEntityBySlug as getCanonicalEntityBySlug } from "@/data/canonical-entities";
import { getEntityBySlug, getEntityProfilePath } from "@/lib/entities";
import { getGuestBySlug } from "@/lib/guests";
import { getEpisodeBySlug } from "@/lib/podcast";

const OWNER = "sam-bennett-what-sprinters-do-differently";
const OWNER_PATH = `/blog/${OWNER}`;
const EPISODES = [
  "sam-bennett-takes-another-step-forward",
  "tdf-stage-19-take-a-bow-sam-bennett",
  "tdf-stage-21-sam-bennett-has-made-history",
  "the-mystery-around-sam-bennett-and-la-tour-de-france",
];
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Sam Bennett entity and CTR owner", () => {
  it("turns the established article owner into a current, source-bounded profile", () => {
    const raw = read(`content/blog/${OWNER}.mdx`);
    const { data, content } = matter(raw);

    expect(data.seoTitle).toBe("Sam Bennett: Tour Wins, Green Jersey & Career");
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("Pinarello Q36.5");
    expect(data.keywords).toEqual(
      expect.arrayContaining(["sam bennett cyclist", "who is sam bennett"]),
    );
    expect(data.featuredEntities).toEqual(["sam-bennett"]);
    expect(data.relatedEpisodes).toEqual(EPISODES);
    expect(data.faq).toHaveLength(5);
    expect(data.citedClaims).toHaveLength(5);
    expect(content.startsWith("\n**Sam Bennett is an Irish professional")).toBe(
      true,
    );
    expect(content).toContain("## Sam Bennett: quick facts");
    expect(content).toContain("## Sources and verification");
    expect(raw).toContain("controlled, legal settings");
    expect(raw).not.toContain("Ireland's greatest sprinter");
    expect(raw).not.toContain("the fastest sprinter in the world");
  });

  it("consolidates the duplicate entity and removes the invented guest relationship", () => {
    const entity = getEntityBySlug("sam-bennett");

    expect(entity).not.toBeNull();
    expect(entity?.canonicalProfilePath).toBe(OWNER_PATH);
    expect(getEntityProfilePath(entity!)).toBe(OWNER_PATH);
    expect(entity?.worksFor?.name).toBe("Pinarello Q36.5 Pro Cycling Team");
    expect(entity?.nationality).toBe("Ireland");
    expect(entity?.guestSlug).toBeUndefined();
    expect(entity?.podcastAppearances).toBeUndefined();
    expect(entity?.relatedEpisodes).toEqual(EPISODES);
    expect(entity?.sources).toHaveLength(6);
    expect(getGuestBySlug("sam-bennett")).toBeNull();

    for (const slug of EPISODES) {
      const episode = getEpisodeBySlug(slug);
      expect(episode?.type).toBe("solo");
      expect(episode?.guest).toBeFalsy();
    }

    const canonical = getCanonicalEntityBySlug("sam-bennett");
    expect(canonical?.affiliation).toBe("Pinarello Q36.5 Pro Cycling Team");
    expect(canonical?.episodes).toEqual([]);
    expect(canonical?.notes).toContain("not guest appearances");
  });

  it("co-locates a full Person node on article identity owners without a self-link", () => {
    const blogPage = read("src/app/(content)/blog/[slug]/page.tsx");
    const featuredExperts = read(
      "src/components/features/blog/FeaturedExperts.tsx",
    );
    const entityPage = read("src/app/(marketing)/entity/[slug]/page.tsx");
    const sitemap = read("src/app/sitemap.ts");

    expect(blogPage).toContain("const canonicalOwnerEntities");
    expect(blogPage).toContain("about: articleAbout");
    expect(blogPage).toContain('"@type": "Person"');
    expect(blogPage).toContain("subjectOf.length > 0");
    expect(featuredExperts).toContain(
      "getEntityProfilePath(e) !== currentPath",
    );
    expect(entityPage).toContain(
      "permanentRedirect(entity.canonicalProfilePath)",
    );
    expect(sitemap).toContain("filter((e) => !e.canonicalProfilePath)");
  });

  it("records the baseline and extends AI and crawler discovery", () => {
    const decision = read("docs/seo/gsc-sam-bennett-opportunity-2026-08-26.md");
    expect(decision).toContain("19 clicks");
    expect(decision).toContain("2,918 impressions");
    expect(decision).toContain("0.7% CTR");
    expect(decision).toContain("Average position 9.6");
    expect(decision).toContain("2,916");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Sam Bennett: Tour Green Jersey, Career and Sprinting Craft",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/entity/sam-bennett",
      ...EPISODES.map((s) => `/podcast/${s}`),
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
        id: 271,
        target_page: OWNER_PATH,
        prompt:
          "who is Sam Bennett cyclist which team does he ride for and what has he won",
      }),
    );
  });
});
