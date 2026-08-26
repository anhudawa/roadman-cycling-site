import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "zone-2-cycling-heart-rate-vs-power-vs-rpe";
const OWNER_PATH = "/blog/" + OWNER;
const RETIRED_BLOGS = [
  "zone-2-training-complete-guide",
  "zone-2-training-cycling-complete-guide",
  "cycling-zone-2-how-to-do-it-properly-guide",
];
const RETIRED_ANSWERS = [
  "what-is-zone-2-training",
  "zone-2-heart-rate-cycling",
  "zone-2-heart-rate-or-power",
  "what-is-zone-2-heart-rate-cycling",
];

describe("Zone 2 cycling search owner and evidence trust", () => {
  const raw = read("content/blog/" + OWNER + ".mdx");
  const { data, content } = matter(raw);

  it("publishes one reviewed answer for broad Zone 2 intent", () => {
    expect(data.seoTitle).toBe(
      "Zone 2 Cycling: Heart Rate, Power, RPE & LT1",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.primaryHub).toBe("cycling-coaching");
    expect(data.reviewedBy).toContain("threshold-estimation");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(105);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT20M");
    expect(content).toContain("Zone 2 cycling at a glance");
    expect(content).toContain("How to estimate your Zone 2 ceiling");
    expect(content).toContain("How long should a Zone 2 ride be?");
  });

  it("grounds definition, measurement, adaptation and duration boundaries", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/40010355/",
      "https://pubmed.ncbi.nlm.nih.gov/40225831/",
      "https://pubmed.ncbi.nlm.nih.gov/40560504/",
      "https://pubmed.ncbi.nlm.nih.gov/39390310/",
      "https://pubmed.ncbi.nlm.nih.gov/40459444/",
      "https://pubmed.ncbi.nlm.nih.gov/25010379/",
      "https://pubmed.ncbi.nlm.nih.gov/35507232/",
      "https://pubmed.ncbi.nlm.nih.gov/29934848/",
      "https://pubmed.ncbi.nlm.nih.gov/27657502/",
    ]) {
      expect(raw).toContain(url);
    }

    for (const boundary of [
      "Zone 2 is a name attached to more than one system",
      "The anchor matters more than the percentage",
      "Power is the dose; heart rate and RPE describe the response",
      "A proxy is useful without being exact",
      "There is no evidence-backed minimum of 60 or 90 minutes",
      "Zone 2 is useful because it is scalable, not because it owns a unique adaptation",
    ]) {
      expect(content).toContain(boundary);
    }
  });

  it("removes fixed-percentage, duration and metric-referee absolutes", () => {
    for (const staleClaim of [
      "heart rate is the more honest signal",
      "If any one of the three is wrong, the ride is not zone 2",
      "The aerobic adaptations begin around 60 minutes",
      "set the ceiling at roughly 75 per cent of max",
      "a single weekly long zone 2 ride of three to four hours",
      "Zone 2 is the lowest productive aerobic training zone",
      "if you're mouth-breathing, you've left Zone 2",
      "fat is the dominant fuel",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("retires three broad guides and four duplicate answers permanently", () => {
    for (const slug of RETIRED_BLOGS) {
      expect(
        existsSync(
          resolve(process.cwd(), "content/blog/" + slug + ".mdx"),
        ),
        slug,
      ).toBe(false);
    }

    const answerData =
      read("src/lib/answers-data/zone2.ts") +
      read("src/lib/answers-data/high-volume-queries-10.ts");
    for (const slug of RETIRED_ANSWERS) {
      expect(answerData).not.toContain('slug: "' + slug + '"');
    }

    const redirects = read("next.config.ts");
    for (const slug of RETIRED_BLOGS) {
      expect(redirects).toContain(
        'source: "/blog/' +
          slug +
          '", destination: "' +
          OWNER_PATH +
          '", permanent: true',
      );
    }
    for (const slug of RETIRED_ANSWERS) {
      expect(redirects).toContain(
        'source: "/answers/' +
          slug +
          '", destination: "' +
          OWNER_PATH +
          '", permanent: true',
      );
    }
  });

  it("keeps only the canonical owner in active sitemap discovery", async () => {
    const blogUrls = (await sitemap({ id: Promise.resolve("1") })).map(
      (entry) => entry.url,
    );
    expect(blogUrls).toContain("https://roadmancycling.com" + OWNER_PATH);
    for (const slug of RETIRED_BLOGS) {
      expect(blogUrls).not.toContain(
        "https://roadmancycling.com/blog/" + slug,
      );
    }

    const taxonomyUrls = (await sitemap({ id: Promise.resolve("5") })).map(
      (entry) => entry.url,
    );
    for (const slug of RETIRED_ANSWERS) {
      expect(taxonomyUrls).not.toContain(
        "https://roadmancycling.com/answers/" + slug,
      );
    }
    expect(taxonomyUrls).not.toContain(
      "https://roadmancycling.com/glossary/zone-2",
    );
  });

  it("routes the glossary entity and learning hub to the canonical owner", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain('slug: "zone-2"');
    expect(glossary).toContain('canonicalPath: "' + OWNER_PATH + '"');
    expect(glossary).toContain(
      "the exact label and boundary depend on the zone system and anchor",
    );

    const hubs = read("src/lib/cluster-hubs.ts");
    expect(hubs).toContain('path: "/training/zone-2"');
    expect(hubs).toContain(
      "[Zone 2 cycling: heart rate, power, RPE and LT1](" +
        OWNER_PATH +
        ")",
    );
    expect(hubs).toContain(
      "There is no evidence-backed 60- or 90-minute minimum",
    );
  });

  it("preserves distinct testing, comparison, duration and diagnostic jobs", () => {
    for (const path of [
      "content/blog/find-your-zone-2-lactate-testing-san-millan.mdx",
      "content/blog/zone-2-vs-endurance-training.mdx",
      "content/blog/what-experts-say-about-zone-2-training.mdx",
      "content/blog/zone-2-not-working-cycling.mdx",
      "content/blog/zone-2-running-vs-cycling-heart-rate.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), path)), path).toBe(true);
    }
    expect(read("src/lib/answers-data/zone2.ts")).toContain(
      'slug: "zone-2-without-power-meter"',
    );
    expect(read("src/lib/answers-data/zone2.ts")).toContain(
      'slug: "how-long-should-zone-2-rides-be"',
    );
  });

  it("extends LLM discovery, AI benchmarking, recrawl and GSC measurement", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain('"' + OWNER + '"');
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      OWNER + " — Canonical Zone 2 cycling owner",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain('"' + OWNER + '"');

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 291,
        prompt:
          "what heart rate is Zone 2 cycling and should I use power or RPE instead",
        target_page: OWNER_PATH,
      }),
    );

    const decision = read(
      "docs/seo/gsc-zone-2-consolidation-2026-08-26.md",
    );
    for (const signal of [
      "28,259",
      "6,820",
      "4,730",
      "zone 2 cycling",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
