import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_SLUG = "unbound-gravel-2026-complete-guide";
const OWNER_PATH = `/blog/${OWNER_SLUG}`;
const PODCAST_PATH = "/podcast/mads-wurtz-schmidt-muddiest-unbound-2026-win";

describe("Unbound Gravel 2026 result search owner", () => {
  it("turns the established preview URL into the reviewed result owner", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));

    expect(article.data.title).toBe(
      "Unbound Gravel 2026 Results: Winners, Times and Race Story",
    );
    expect(article.data.seoTitle).toBe(
      "Unbound Gravel 2026 Results: Winners, Times & Race Story",
    );
    expect(article.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.reviewedBy).toContain("Anthony Walsh");
    expect(article.data.keyTakeaways).toHaveLength(4);
    expect(article.data.faq).toHaveLength(5);
    expect(article.data.citedClaims).toHaveLength(3);
  });

  it("publishes the verified winners, top-five times and decisive incidents", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));
    const complete = `${JSON.stringify(article.data)}\n${article.content}`;

    for (const fact of [
      "Mads Würtz Schmidt",
      "9:14:51",
      "Matthew Beers",
      "9:19:54",
      "Tobias Kongstad",
      "9:24:43",
      "Brendan Johnston",
      "9:36:46",
      "Keegan Swenson",
      "9:39:19",
      "Sofía Gómez Villafañe",
      "10:31:37",
      "Geerike Schreurs",
      "10:31:38",
      "Cecily Decker",
      "Paige Onweller",
      "Rosa Klöser",
      "10:31:39",
      "mile 11",
      "mile 150",
    ]) {
      expect(complete).toContain(fact);
    }

    expect(article.data.answerCapsule).toContain("30 May");
    expect(article.data.answerCapsule).toContain("wheel change");
    expect(article.data.relatedEpisodes).toContain(
      "mads-wurtz-schmidt-muddiest-unbound-2026-win",
    );
  });

  it("uses official sources and removes stale predictions and universal rules", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));

    for (const source of [
      "https://www.lifetimegrandprix.com/2026/05/30/",
      "https://www.unboundgravel.com/results/",
      "https://www.unboundgravel.com/routes/",
      "https://www.unboundgravel.com/athlete-guides/",
      "https://www.unboundgravel.com/officialrules/",
    ]) {
      expect(article.content).toContain(source);
    }

    for (const staleClaim of [
      "This Saturday",
      "defends her title",
      "Rain all week",
      "Who to watch: the men's field",
      "Who to watch: the women's field",
      "Electrolytes are not optional",
      "weight in pounds divided by 7",
      "80-120g",
      "if you're not peeing",
    ]) {
      expect(article.content).not.toContain(staleClaim);
    }
  });

  it("records the GSC baseline and aligns crawler and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-unbound-gravel-2026-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "27",
      "3,339",
      "0.8%",
      "8.6",
      "3,333",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Unbound Gravel 2026 results and race story",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(OWNER_PATH);
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER_SLUG);

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(OWNER_PATH);
    expect(indexNow).toContain(PODCAST_PATH);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 275,
        target_page: OWNER_PATH,
        prompt:
          "who won Unbound Gravel 2026 and what happened in the 200 mile races",
      }),
    );
  });
});
