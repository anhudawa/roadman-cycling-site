import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { heatAnswers } from "@/lib/answers-data/heat";
import { highVolumeQuery14Answers } from "@/lib/answers-data/high-volume-queries-14";
import { racingAnswers } from "@/lib/answers-data/racing";
import { PROBLEM_PAGES } from "@/lib/problems";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER = "cycling-cramp-prevention";
const LEGACY_ANSWER = "what-causes-muscle-cramps-cycling";

describe("cycling cramp search ownership and evidence trust", () => {
  it("keeps one reviewed broad owner with extractable evidence and safety boundaries", () => {
    const owner = matter(read(`content/blog/${OWNER}.mdx`));

    expect(owner.data.seoTitle).toBe(
      "Cycling Cramps: Causes, Prevention & What to Do",
    );
    expect(owner.data.updatedDate).toBe("2026-08-26");
    expect(owner.data.lastReviewed).toBe("2026-08-26");
    expect(owner.data.reviewedBy).toContain("Anthony Walsh");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(6);
    expect(owner.data.answerCapsule).toContain("multifactorial");
    expect(owner.data.answerCapsule).toContain("static stretch");
    expect(owner.content).toContain(
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC8775277/",
    );
    expect(owner.content).toContain(
      "https://pubmed.ncbi.nlm.nih.gov/19997012/",
    );
    expect(owner.content).toContain(
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC8094171/",
    );
    expect(owner.content.toLowerCase()).toContain("cramping after rides");
    expect(owner.content).toContain("dark urine");
    expect(owner.content).not.toContain("1,000-1,500mg");
    expect(owner.content).not.toContain("500-700ml per hour");
  });

  it("retires the exact-match duplicate with a permanent redirect", () => {
    expect(
      highVolumeQuery14Answers.some(({ slug }) => slug === LEGACY_ANSWER),
    ).toBe(false);

    const redirects = read("next.config.ts");
    expect(redirects).toContain(
      `source: "/answers/${LEGACY_ANSWER}"`,
    );
    expect(redirects).toContain(
      `destination: "/blog/${OWNER}"`,
    );
  });

  it("keeps the long-ride, race and heat pages narrow and linked to the owner", () => {
    const problem = PROBLEM_PAGES.find(
      ({ slug }) => slug === "cramp-on-long-rides",
    );
    expect(problem?.seoTitle).toContain("Long Rides");
    expect(problem?.solutions.some(({ href }) => href === `/blog/${OWNER}`)).toBe(
      true,
    );
    expect(problem?.causes.join(" ")).toContain("not a diagnosis");

    const race = racingAnswers.find(
      ({ slug }) => slug === "how-to-stop-cramping-in-races",
    );
    expect(race?.updatedDate).toBe("2026-08-26");
    expect(race?.reviewedBy).toContain("Anthony Walsh");
    expect(race?.directAnswer).toContain("static stretch");
    expect(race?.directAnswer).toContain("dark urine");
    expect(race?.relatedTopics.some(({ href }) => href === `/blog/${OWNER}`)).toBe(
      true,
    );
    expect(race?.expertEvidence).toHaveLength(0);

    const heat = heatAnswers.find(
      ({ slug }) => slug === "cramping-in-hot-weather",
    );
    expect(heat?.updatedDate).toBe("2026-08-26");
    expect(heat?.directAnswer).toContain("not proof");
    expect(heat?.faq.some(({ answer }) => answer.includes("static stretch"))).toBe(
      true,
    );
    expect(heat?.relatedTopics.some(({ href }) => href === `/blog/${OWNER}`)).toBe(
      true,
    );
  });

  it("preserves the podcast as a source-bounded historical record", () => {
    const episode = matter(
      read("content/podcast/what-causes-muscle-cramp-and-how-to-avoid-it.mdx"),
    );

    expect(episode.data.publishDate).toBe("2021-01-15");
    expect(episode.data.updatedDate).toBe("2026-08-26");
    expect(episode.data.lastReviewed).toBe("2026-08-26");
    expect(episode.data.reviewedBy).toContain("verbatim 2021 transcript");
    expect(episode.data.transcript).toContain("Lettras the 81 kilometer");
    expect(episode.data.answerCapsule).toContain("historical transcript");
    expect(episode.content).toContain(`/blog/${OWNER}`);
    expect(episode.content).toContain("not a current clinical consensus");
  });

  it("aligns machine-readable discovery and the nutrition hub", () => {
    expect(read("content/topics/cycling-nutrition.mdx")).toContain(
      `/blog/${OWNER}`,
    );
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Cycling cramps: causes, response and prevention",
    );
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER);

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain("CRAMP_TRUST_CLUSTER");
    expect(indexNow).toContain("CRAMP_ANSWER_TRUST_CLUSTER");
    expect(indexNow).toContain("/problem/cramp-on-long-rides");
    expect(indexNow).toContain(
      "/podcast/what-causes-muscle-cramp-and-how-to-avoid-it",
    );

    const prompts = JSON.parse(
      read("scripts/ai-benchmark-prompts.json"),
    ) as { prompts: { id: number; target_page: string }[] };
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 252, target_page: `/blog/${OWNER}` }),
        expect.objectContaining({ id: 253, target_page: `/blog/${OWNER}` }),
        expect.objectContaining({ id: 254, target_page: `/blog/${OWNER}` }),
        expect.objectContaining({
          id: 255,
          target_page: "/problem/cramp-on-long-rides",
        }),
      ]),
    );
  });

  it("records the Search Console baseline and measurement cohorts", () => {
    const decision = read(
      "docs/seo/gsc-cycling-cramp-consolidation-2026-08-26.md",
    );
    expect(decision).toContain("1,047");
    expect(decision).toContain("0.3% CTR");
    expect(decision).toContain("6.2 average position");
    expect(decision).toContain("790");
    expect(decision).toContain("275");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");
  });
});
