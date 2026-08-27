import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH =
  "content/blog/richard-mille-cycling-watches-modern-peloton.mdx";
const OWNER_ROUTE = "/blog/richard-mille-cycling-watches-modern-peloton";

describe("GSC Pogačar watch owner", () => {
  it("publishes a direct, current and source-bounded owner answer", () => {
    const source = read(OWNER_PATH);
    const page = matter(source);

    expect(page.data.title).toBe(
      "What Watch Does Tadej Pogačar Wear? Richard Mille Guide",
    );
    expect(page.data.seoTitle).toBe(
      "What Watch Does Tadej Pogačar Wear? RM 67-02 Guide",
    );
    expect(page.data.updatedDate).toBe("2026-08-27");
    expect(page.data.lastReviewed).toBe("2026-08-27");
    expect(page.data.answerCapsule).toContain("RM 67-02");
    expect(page.data.answerCapsule).toContain("32 grams");
    expect(page.data.answerCapsule).toContain("RM 64-01");
    expect(page.data.answerCapsule).toContain("limited to 50 pieces");
    expect(page.data.answerCapsule).toContain("not official list prices");
    expect(page.data.faq).toHaveLength(6);
    expect(page.data.citedClaims).toHaveLength(5);

    for (const url of [
      "https://www.richardmille.com/friends-and-partners/tadej-pogacar",
      "https://www.richardmille.com/friends-and-partners/uae-team-emirates",
      "https://www.richardmille.com/collections/rm-67-02-automatic-extra-flat",
      "https://www.richardmille.com/collections/rm-64-01",
      "https://www.colnago.com/en-pt/news/colnago-and-richard-mille-present-the-rm-64-01-tourbillon-colnago",
      "https://www.letour.fr/en/news/2026/van-der-poel-and-pogacar-illuminate-paris/1356643",
    ]) {
      expect(source).toContain(url);
    }

    expect(source).toContain("Pogačar was the rider shown bleeding");
    expect(source).not.toContain(
      "Cycling entered the picture in 2021 when Tadej Pogačar became a Richard Mille ambassador",
    );
    expect(source).not.toContain("retail price of approximately $350,000");
    expect(source).not.toContain("The brand pays the rider a retainer");
  });

  it("narrows supporting pages and keeps their links pointed at the owner", () => {
    const supportingPaths = [
      "content/blog/tudor-bumblebee-watches-tour-de-france.mdx",
      "content/blog/tudor-pro-cycling-tour-de-france-2026.mdx",
      "content/blog/against-the-clock-cycling-watches.mdx",
      "content/topics/against-the-clock.mdx",
      "content/blog/omega-olympic-timing-track-cycling-hour-record.mdx",
      "content/blog/breitling-top-time-eddy-merckx-cycling-watch.mdx",
      "content/blog/breitling-top-time-coppi-bartali-cycling-rivalry.mdx",
      "content/blog/casio-f91w-ten-mile-time-trial-cycling.mdx",
    ];
    const combined = supportingPaths.map(read).join("\n");

    expect(combined).not.toContain("ambassador in 2022");
    expect(combined).not.toContain("ambassador for in 2022");
    expect(combined).not.toContain("retail price of approximately $350,000");

    for (const path of [
      "content/blog/tudor-bumblebee-watches-tour-de-france.mdx",
      "content/blog/tudor-pro-cycling-tour-de-france-2026.mdx",
      "content/blog/against-the-clock-cycling-watches.mdx",
      "content/topics/against-the-clock.mdx",
    ]) {
      expect(read(path)).toContain(OWNER_ROUTE);
    }
  });

  it("extends LLM discovery, recrawl and answer-engine measurement", () => {
    const llms = read("src/app/llms.txt/route.ts");
    const pinned = read("src/lib/seo/llms-content.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(llms).toContain(OWNER_ROUTE);
    expect(pinned).toContain("richard-mille-cycling-watches-modern-peloton");

    for (const path of [
      OWNER_ROUTE,
      "/blog/tudor-bumblebee-watches-tour-de-france",
      "/blog/tudor-pro-cycling-tour-de-france-2026",
      "/blog/against-the-clock-cycling-watches",
      "/topics/against-the-clock",
    ]) {
      expect(indexNow).toContain(path);
    }

    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts.slice(-2)).toMatchObject([
      { id: 317, target_page: OWNER_ROUTE },
      { id: 318, target_page: OWNER_ROUTE },
    ]);
  });
});
