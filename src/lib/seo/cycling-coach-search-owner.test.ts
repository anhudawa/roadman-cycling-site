import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { metadata } from "@/app/(marketing)/coaching/page";
import { getTopicBySlug } from "@/lib/topics";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER_PATH = "/coaching";
const SELECTION_SLUG = "best-online-cycling-coach-how-to-choose";
const RETIRED_SLUG = "best-cycling-coach-guide";

describe("cycling coach search ownership", () => {
  it("makes the commercial page the explicit broad owner", () => {
    expect(metadata.title).toEqual({
      absolute: "Online Cycling Coach | Personalised Cycling Coaching",
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/coaching",
    );
    expect(metadata.description).toContain("online cycling coach");
    expect(metadata.description).toContain("weekly review");
    expect(metadata.description).toContain("$195/month");

    const page = read("src/app/(marketing)/coaching/page.tsx");
    for (const phrase of [
      "ONLINE CYCLING COACH",
      "WHAT AN ONLINE CYCLING COACH DOES",
      "SERVICE FACTS · REVIEWED 26 AUGUST 2026",
      'dateModified: "2026-08-26"',
      "editor: { \"@id\": ENTITY_IDS.person }",
      "seller: { \"@id\": ENTITY_IDS.organization }",
    ]) {
      expect(page).toContain(phrase);
    }
  });

  it("keeps the topic hub educational and routes commercial intent to the owner", () => {
    const topic = getTopicBySlug("cycling-coaching");
    expect(topic?.title).toBe(
      "How Cycling Coaching Works — Cost, Fit & Methods",
    );
    expect(topic?.headline).toBe("CYCLING COACHING KNOWLEDGE GUIDE");
    expect(topic?.commercialPath).toBe(OWNER_PATH);
    expect(topic?.lastReviewed).toBe("2026-08-26");
    expect(topic?.reviewedBy?.name).toBe("Anthony Walsh");
    expect(topic?.keywords).not.toContain("cycling coach");
    expect(topic?.keywords).not.toContain("online cycling coach");

    const guide = read("content/topics/cycling-coaching.mdx");
    for (const phrase of [
      "assessment, planning, review, adaptation and explanation",
      "Delivery formats, not quality grades",
      "Four-week billing creates 13 charges",
      "accountability for judgement",
      "Scope, safety and data",
      "named review date and reviewer",
      "/blog/best-online-cycling-coach-how-to-choose",
      "/blog/how-much-does-online-cycling-coach-cost-2026",
      "/coaching",
    ]) {
      expect(guide.toLowerCase()).toContain(phrase.toLowerCase());
    }
    for (const staleClaim of [
      "single fastest way",
      "Most amateurs see measurable fitness gains in the first 6-8 weeks",
      "For 90% of amateur cyclists",
      "Anything below $100/month",
      "They cannot adjust for life",
      "online coaching is equally effective",
    ]) {
      expect(guide).not.toContain(staleClaim);
    }

    const topicTemplate = read("src/app/(content)/topics/[slug]/page.tsx");
    expect(topicTemplate).toContain("dateModified: topic.lastReviewed");
    expect(topicTemplate).toContain("Editorially reviewed");
    expect(topicTemplate).toContain("editor:");
  });

  it("consolidates the weaker generic selection guide", () => {
    expect(
      existsSync(resolve(root, `content/blog/${RETIRED_SLUG}.mdx`)),
    ).toBe(false);

    const redirects = read("next.config.ts");
    const source = `source: \"/blog/${RETIRED_SLUG}\"`;
    const redirect = redirects.slice(
      redirects.indexOf(source),
      redirects.indexOf(source) + 320,
    );
    expect(redirects).toContain(source);
    expect(redirect).toContain(
      `destination: \"/blog/${SELECTION_SLUG}\"`,
    );
    expect(redirect).toContain("permanent: true");

    const selection = matter(
      read(`content/blog/${SELECTION_SLUG}.mdx`),
    );
    expect(selection.data.updatedDate).toBe("2026-08-26");
    expect(selection.data.lastReviewed).toBe("2026-08-26");
    expect(selection.data.keywords).toContain("best cycling coach");
    expect(selection.content).toContain(
      "There is no single best cycling coach, online or local",
    );
  });

  it("removes the retired slug from active discovery and the sitemap", async () => {
    const activeFiles = [
      "src/lib/topics.ts",
      "scripts/submit-indexnow.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/lib/seo/llms-content.ts",
      "content/blog/best-cycling-coach-uk.mdx",
      "content/blog/best-cycling-coach-ireland.mdx",
      "content/blog/best-cycling-coach-usa.mdx",
      "content/blog/cycling-coach-near-me-why-location-doesnt-matter-2026.mdx",
    ];
    for (const path of activeFiles) {
      expect(read(path), path).not.toContain(RETIRED_SLUG);
    }

    const blogSitemap = await sitemap({ id: Promise.resolve("1") });
    expect(blogSitemap.some(({ url }) => url.endsWith(`/${RETIRED_SLUG}`))).toBe(
      false,
    );
    expect(
      blogSitemap.some(({ url }) => url.endsWith(`/${SELECTION_SLUG}`)),
    ).toBe(true);
  });

  it("aligns AI discovery, IndexNow and the GSC measurement cohort", () => {
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 256, target_page: OWNER_PATH }),
        expect.objectContaining({
          id: 257,
          target_page: `/blog/${SELECTION_SLUG}`,
        }),
        expect.objectContaining({ id: 258, target_page: OWNER_PATH }),
        expect.objectContaining({
          id: 259,
          target_page: "/coaching/masters",
        }),
      ]),
    );

    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      "/coaching`",
      "/topics/cycling-coaching`",
      "/coaching/masters`",
      "/careers`",
    ]) {
      expect(indexNow).toContain(path);
    }

    const shortLlms = read("src/app/llms.txt/route.ts");
    expect(shortLlms).toContain("Canonical Roadman service page");
    expect(shortLlms).toContain("Educational knowledge guide");
    expect(shortLlms).toContain("Reviewed nine-point provider-selection");

    const decision = read(
      "docs/seo/gsc-cycling-coach-search-ownership-2026-08-26.md",
    );
    for (const signal of [
      "11,024",
      "1,467",
      "19 Roadman URLs",
      "7,312",
      "1,893",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
