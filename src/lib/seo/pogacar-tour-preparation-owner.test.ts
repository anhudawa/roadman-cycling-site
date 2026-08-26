import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_SLUG = "tdf-2026-contenders-preparation-lessons";
const OWNER_PATH = `/blog/${OWNER_SLUG}`;

describe("Pogačar 2026 Tour preparation search owner", () => {
  it("turns the incumbent preview into the reviewed post-race owner", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));

    expect(article.data.title).toBe(
      "Pogačar's 2026 Tour de France Preparation: What Worked",
    );
    expect(article.data.seoTitle).toBe(article.data.title);
    expect(article.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.reviewedBy).toContain("Anthony Walsh");
    expect(article.data.keyTakeaways).toHaveLength(5);
    expect(article.data.faq).toHaveLength(6);
    expect(article.data.citedClaims).toHaveLength(5);
  });

  it("answers the public preparation record and final result", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));
    const complete = `${JSON.stringify(article.data)}\n${article.content}`;

    for (const fact of [
      "16 days of competition",
      "Tour de Romandie",
      "Tour de Suisse",
      "five stage wins",
      "73:56:26",
      "6:26",
      "fifth Tour",
    ]) {
      expect(complete).toContain(fact);
    }

    for (const source of [
      "https://www.letour.fr/en/news/2026/info-with-two-days-to-go/1333137",
      "https://www.letour.fr/en/rankings",
      "https://www.uaeteamemirates.com/tadej-pogacar-aims-record-equalling-fifth-tour-de-france-title/",
      "https://www.uaeteamemirates.com/tadej-pogacar-wins-record-equalling-fifth-tour-de-france-uae-team-emirates-xrg/",
      "https://pubmed.ncbi.nlm.nih.gov/37163550/",
    ]) {
      expect(article.content).toContain(source);
    }
  });

  it("separates documented preparation from private data and causation", () => {
    const article = matter(read(`content/blog/${OWNER_SLUG}.mdx`));
    const complete = `${JSON.stringify(article.data)}\n${article.content}`;

    for (const boundary of [
      "complete day-by-day training plan",
      "power files",
      "does not isolate causation",
      "not a controlled experiment",
      "not interchangeable shortcuts",
    ]) {
      expect(complete).toContain(boundary);
    }

    for (const staleClaim of [
      "The 2026 Tour de France starts on 5 July",
      "Pogačar races a full Classics calendar",
      "Vingegaard builds quietly around long altitude camps and a light race programme",
      "heat training is the amateur's accessible proxy",
    ]) {
      expect(article.content).not.toContain(staleClaim);
    }
  });

  it("records the baseline and aligns crawler and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-pogacar-tour-preparation-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "3",
      "2,458",
      "0.1%",
      "7.7",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Pogačar's 2026 Tour preparation",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(OWNER_PATH);
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER_SLUG);
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER_PATH);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 277,
        target_page: OWNER_PATH,
        prompt:
          "how did Tadej Pogacar prepare for the 2026 Tour de France and what can amateur cyclists copy",
      }),
    );
  });
});
