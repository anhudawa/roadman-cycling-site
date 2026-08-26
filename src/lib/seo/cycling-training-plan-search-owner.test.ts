import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { metadata } from "@/app/(marketing)/training-plans/page";
import { getTopicBySlug } from "@/lib/topics";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER_PATH = "/training-plans";
const TOPIC_PATH = "/topics/cycling-training-plans";
const SELECTION_PATH = "/blog/cycling-how-to-choose-a-training-plan-guide";
const CASE_PATH = "/blog/how-pro-cyclist-trains-60-days";

describe("cycling training-plan search ownership", () => {
  it("makes the coached service the explicit commercial owner", () => {
    expect(metadata.title).toEqual({
      absolute: "Cycling Training Plans for 6–12 Hours a Week",
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/training-plans",
    );
    expect(metadata.description).toContain("TrainingPeaks");
    expect(metadata.description).toContain("weekly review");
    expect(metadata.description).toContain("$195/month");

    const page = read("src/app/(marketing)/training-plans/page.tsx");
    for (const phrase of [
      "WHAT ROADMAN CYCLING TRAINING PLANS ARE",
      "SERVICE FACTS · REVIEWED 26 AUGUST 2026",
      'dateModified: "2026-08-26"',
      'editor: { "@id": ENTITY_IDS.person }',
      'seller: { "@id": ENTITY_IDS.organization }',
      "not one-off downloads",
    ]) {
      expect(page).toContain(phrase);
    }
  });

  it("keeps the methodology hub educational and routes buying intent to the owner", () => {
    const topic = getTopicBySlug("cycling-training-plans");

    expect(topic?.title).toBe(
      "How to Build a Cycling Training Plan — Method Guide",
    );
    expect(topic?.headline).toBe("CYCLING TRAINING PLAN METHODOLOGY");
    expect(topic?.commercialPath).toBe(OWNER_PATH);
    expect(topic?.lastReviewed).toBe("2026-08-26");
    expect(topic?.reviewedBy?.name).toBe("Anthony Walsh");
    expect(topic?.keywords).not.toContain("cycling training plans");
    expect(topic?.citedClaims.map(({ claim }) => claim)).toEqual([
      "No periodisation model is a universal winner",
      "An intensity label is not a complete prescription",
      "The rider brief comes before the calendar",
    ]);
    expect(JSON.stringify(topic?.citedClaims)).not.toContain(
      "Two quality sessions are enough for most amateurs",
    );
    expect(JSON.stringify(topic?.faqs)).not.toContain(
      "Meaningful progress is possible on 6–8 structured hours",
    );

    const guide = read("content/topics/cycling-training-plans.mdx");
    for (const phrase of [
      "This is Roadman's educational methodology guide",
      "Periodisation without false precision",
      "Write the review rules before training starts",
      "Static plan, app or coached plan",
      "pubmed.ncbi.nlm.nih.gov/36640771",
      "pubmed.ncbi.nlm.nih.gov/39888556",
      OWNER_PATH,
      SELECTION_PATH,
      CASE_PATH,
    ]) {
      expect(guide).toContain(phrase);
    }
    for (const unsupportedClaim of [
      "Every cyclist should follow 80/20",
      "base is non-negotiable",
      "gain in 12 weeks",
    ]) {
      expect(guide.toLowerCase()).not.toContain(unsupportedClaim);
    }
  });

  it("keeps evaluation, event and case-study intent distinct", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-training-plans");
    expect(owner?.supportingDestinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/plan" }),
        expect.objectContaining({ path: TOPIC_PATH }),
        expect.objectContaining({ path: SELECTION_PATH }),
        expect.objectContaining({ path: CASE_PATH }),
        expect.objectContaining({
          path: "/blog/cycling-training-plan-build-friel-lorang-johnson",
        }),
      ]),
    );

    const selection = matter(
      read("content/blog/cycling-how-to-choose-a-training-plan-guide.mdx"),
    );
    expect(selection.data.updatedDate).toBe("2026-08-26");
    expect(selection.data.lastReviewed).toBe("2026-08-26");
    expect(selection.data.reviewedBy).toContain("Anthony Walsh");
    expect(selection.content).toContain("## The ten checks");
    expect(selection.content).toContain("Roadman sells coached training plans");

    const caseStudy = matter(
      read("content/blog/how-pro-cyclist-trains-60-days.mdx"),
    );
    expect(caseStudy.data.primaryHub).toBe("cycling-training-plans");
    expect(caseStudy.data.updatedDate).toBe("2026-08-26");
    expect(caseStudy.data.lastReviewed).toBe("2026-08-26");
    expect(caseStudy.data.answerCapsule).toContain("not a forecast");
    expect(caseStudy.content).toContain("Stöggl and Sperlich, 2014");
  });

  it("aligns AI discovery, IndexNow and the GSC measurement cohort", () => {
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 260, target_page: OWNER_PATH }),
        expect.objectContaining({ id: 261, target_page: TOPIC_PATH }),
        expect.objectContaining({ id: 262, target_page: SELECTION_PATH }),
        expect.objectContaining({ id: 263, target_page: "/plan" }),
        expect.objectContaining({ id: 264, target_page: CASE_PATH }),
      ]),
    );

    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [OWNER_PATH, TOPIC_PATH, "/plan", SELECTION_PATH, CASE_PATH]) {
      expect(indexNow).toContain(`\`https://\${HOST}${path}\``);
    }

    const shortLlms = read("src/app/llms.txt/route.ts");
    const fullLlms = read("src/app/llms-full.txt/route.ts");
    expect(shortLlms).toContain(
      "Cycling training-plan intent — use the right destination",
    );
    expect(fullLlms).toContain(
      "Cycling training-plan intent — canonical routing",
    );
    expect(shortLlms).toContain("first-person N=1 case study");
    expect(fullLlms).toContain("not a universal plan or outcome guarantee");

    const decision = read(
      "docs/seo/gsc-cycling-training-plan-search-ownership-2026-08-26.md",
    );
    for (const signal of [
      "8,226 impressions",
      "15 Roadman URLs",
      "34 clicks and 780 impressions",
      "28,475 impressions",
      "151 impressions",
      "5 September 2026",
      "26 September 2026",
      "Do not redirect or deindex the 60-day case study",
    ]) {
      expect(decision).toContain(signal);
    }
  });

  it("advertises the refreshed owner and keeps every valuable URL indexable", async () => {
    const ownerSitemap = await sitemap({ id: Promise.resolve("0") });
    const ownerEntry = ownerSitemap.find(({ url }) => url.endsWith(OWNER_PATH));
    expect(ownerEntry?.lastModified).toEqual(new Date("2026-08-26"));

    const blogSitemap = await sitemap({ id: Promise.resolve("1") });
    expect(blogSitemap.some(({ url }) => url.endsWith(SELECTION_PATH))).toBe(true);
    expect(blogSitemap.some(({ url }) => url.endsWith(CASE_PATH))).toBe(true);

    const redirects = read("next.config.ts");
    expect(redirects).not.toContain(`source: "${CASE_PATH}"`);
  });
});
