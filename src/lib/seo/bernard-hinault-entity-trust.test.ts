import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getHistoryArticle } from "@/data/tour-history";

const OWNER = "/tour-de-france/history/bernard-hinault-the-badger";
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Bernard Hinault entity and CTR owner", () => {
  it("turns the established owner into a direct, current biography answer", () => {
    const article = getHistoryArticle("bernard-hinault-the-badger");

    expect(article).toBeDefined();
    expect(article?.seoTitle).toBe("Bernard Hinault: Tour Wins & ‘The Badger’");
    expect(article?.updated).toBe("2026-08-25");
    expect(article?.lastReviewed).toBe("25 August 2026");
    expect(article?.reviewedBy).toContain("official race records");
    expect(article?.quickFacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Tour de France wins", value: expect.stringContaining("1978") }),
        expect.objectContaining({ label: "Tour stage wins", value: "28 individual stages" }),
        expect.objectContaining({ label: "Grand Tour wins", value: expect.stringContaining("10") }),
      ]),
    );
    expect(article?.body.startsWith("Bernard Hinault is a French former professional cyclist")).toBe(true);
    expect(article?.body).toContain("after the 2026 Tour, Tadej Pogačar");
    expect(article?.body).toContain("coaching interpretation, not a fact");
    expect(article?.body).not.toContain("won a sixth that he arguably should have");
  });

  it("connects the article to a bounded Person entity and official sources", () => {
    const article = getHistoryArticle("bernard-hinault-the-badger");
    const page = read("src/app/tour-de-france/history/[slug]/page.tsx");

    expect(article?.person?.name).toBe("Bernard Hinault");
    expect(article?.person?.birthDate).toBe("1954-11-14");
    expect(article?.person?.sameAs).toEqual(
      expect.arrayContaining([
        "https://en.wikipedia.org/wiki/Bernard_Hinault",
        "https://www.wikidata.org/wiki/Q109255",
      ]),
    );
    expect(article?.sources).toHaveLength(9);
    expect(article?.sources?.every((source) => source.scope.length > 20)).toBe(true);
    expect(page).toContain('about: { "@id": personId }');
    expect(page).toContain("article.sources.map((source) => source.url)");
    expect(page).toContain("SOURCES &amp; VERIFICATION");
    expect(page).toContain("<EvidenceBlock");
  });

  it("records the GSC decision and extends discovery and measurement", () => {
    const decision = read("docs/seo/gsc-bernard-hinault-opportunity-2026-08-25.md");
    expect(decision).toContain("40 clicks");
    expect(decision).toContain("10,015 impressions");
    expect(decision).toContain("0.4% CTR");
    expect(decision).toContain("Average position 8.2");
    expect(decision).toContain("9,875");
    expect(decision).toContain("earliest reliable review **3 September 2026**");
    expect(decision).toContain("**24 September 2026**");

    const sitemap = read("src/app/sitemap.ts");
    const llms = read("src/app/llms.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    expect(sitemap).toContain("new Date(a.updated ?? a.published)");
    expect(llms).toContain("Bernard Hinault: Five Tours, 28 Stages");
    expect(indexNow).toContain(OWNER);

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 226,
        target_page: OWNER,
        prompt: "who is Bernard Hinault and how many Tours de France and Grand Tours did he win",
      }),
    );
  });
});
