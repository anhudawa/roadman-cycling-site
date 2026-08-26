import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_SLUG = "why-netflix-unchained-failed-cycling";
const OWNER_PATH = `/blog/${OWNER_SLUG}`;
const PODCAST_SLUG =
  "ep-2034-how-netflix-s-unchained-failed-why-every-pro-hated-it";
const PODCAST_PATH = `/podcast/${PODCAST_SLUG}`;

describe("Tour de France Unchained search owner", () => {
  it("turns the incumbent opinion URL into the reviewed series owner", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));

    expect(article.data.title).toBe(
      "Tour de France: Unchained — Seasons, Episodes and Why It Ended",
    );
    expect(article.data.seoTitle).toBe(
      "Tour de France: Unchained — Seasons, Cast & Ending",
    );
    expect(article.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.reviewedBy).toContain("Anthony Walsh");
    expect(article.data.keyTakeaways).toHaveLength(4);
    expect(article.data.faq).toHaveLength(6);
    expect(article.data.citedClaims).toHaveLength(4);
  });

  it("answers seasons, episodes, race years, watching and final status", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));
    const complete = `${JSON.stringify(article.data)}\n${article.content}`;

    for (const fact of [
      "three-season",
      "24 episodes",
      "2022",
      "2023",
      "2024",
      "final season",
      "no season 4",
      "Netflix",
    ]) {
      expect(complete).toContain(fact);
    }

    for (const source of [
      "https://www.netflix.com/title/81153133",
      "https://media.netflix.com/en/only-on-netflix/81153133",
      "https://about.netflix.com/ro/news/top-10-week-of-june-12",
      "https://about.netflix.com/en/news/top-10-week-of-jun-10",
      "https://www.letour.fr/en/news/2025/watch-season-3-of-series-unchained-now/1324948",
    ]) {
      expect(article.content).toContain(source);
    }
  });

  it("corrects the viewing metric and removes unsupported causal claims", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));

    expect(article.content).toContain("1.5 million views");
    expect(article.content).toContain("1.1 million views");
    expect(article.content).toContain(
      "views, not individual viewers or watch hours",
    );

    for (const staleClaim of [
      "1.5M vs 57M Watch Hours",
      "1.5 million watch hours",
      "Only 8 of 22",
      "8 million euro",
      "structural rejection",
    ]) {
      expect(article.content).not.toContain(staleClaim);
    }
  });

  it("corrects visible podcast claims while preserving the archived recording", () => {
    const episode = matter(read(`content/podcast/${PODCAST_SLUG}.mdx`));
    const { transcript, ...visibleData } = episode.data;
    const visible = JSON.stringify(visibleData);

    expect(transcript).toContain("1.5 million");
    expect(visibleData.updatedDate).toBe("2026-08-26");
    expect(visibleData.lastReviewed).toBe("2026-08-26");
    expect(visibleData.answerCapsule).toContain("not 1.5 million watch hours");
    expect(visibleData.keyTakeaways).toHaveLength(4);
    expect(visibleData.claims).toHaveLength(4);
    expect(visibleData.faq).toHaveLength(3);
    expect(visibleData.citations).toHaveLength(5);
    expect(visible).not.toContain("Only 8 of 22");
    expect(visible).not.toContain("8 million euro");
  });

  it("records the baseline and aligns crawler and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-tour-de-france-unchained-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "21",
      "2,479",
      "0.8%",
      "10.0",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Tour de France: Unchained — series guide",
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
        id: 276,
        target_page: OWNER_PATH,
        prompt:
          "how many seasons of Tour de France Unchained are there and will there be a season 4",
      }),
    );
  });
});
