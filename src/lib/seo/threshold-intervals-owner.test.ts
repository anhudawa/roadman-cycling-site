import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getAnswerBySlug } from "@/lib/answers";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "/answers/threshold-intervals-guide";
const RETIRED_BLOG = "/blog/cycling-threshold-intervals-guide";

describe("cycling threshold-interval search owner and evidence trust", () => {
  it("strengthens the incumbent answer without moving its established URL", () => {
    const answer = getAnswerBySlug("threshold-intervals-guide");
    const words = answer?.directAnswer.split(/\s+/).filter(Boolean) ?? [];

    expect(answer?.question).toBe(
      "How Should Cyclists Do Threshold Intervals?",
    );
    expect(answer?.seoTitle).toBe(
      "Threshold Intervals Cycling: Workouts & Progression",
    );
    expect(answer?.seoTitle.length).toBeLessThanOrEqual(60);
    expect(answer?.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(answer?.seoDescription.length).toBeLessThanOrEqual(160);
    expect(answer?.updatedDate).toBe("2026-08-26");
    expect(answer?.reviewedBy).toBe("Anthony Walsh");
    expect(words.length).toBeGreaterThanOrEqual(40);
    expect(words.length).toBeLessThanOrEqual(80);
    expect(answer?.keyTakeaways).toHaveLength(4);
    expect(answer?.practicalApplication).toHaveLength(5);
    expect(answer?.commonMistakes).toHaveLength(4);
    expect(answer?.faq).toHaveLength(8);
  });

  it("publishes primary evidence and explicit prescription boundaries", () => {
    const answer = getAnswerBySlug("threshold-intervals-guide");
    const rendered = JSON.stringify(answer);

    expect(answer?.sources).toHaveLength(8);
    for (const pmid of [
      "35835698",
      "34304689",
      "33551839",
      "20535658",
      "29863593",
      "28253026",
      "9504136",
      "42051616",
    ]) {
      expect(rendered).toContain(`pubmed.ncbi.nlm.nih.gov/${pmid}`);
    }

    for (const boundary of [
      "not one compulsory 2×20 workout",
      "does not establish one of them as the universal best",
      "There is no universal weekly threshold dose",
      "power, heart rate and RPE",
      "does not prove a universal dose",
    ]) {
      expect(rendered).toContain(boundary);
    }

    for (const staleClaim of [
      "2×20 min at 95–105% FTP is the benchmark session",
      "Two threshold sessions per week is the ceiling",
      "40–60g of carbs before and during",
      "gold-standard FTP development session",
      "physiologically superior",
    ]) {
      expect(rendered).not.toContain(staleClaim);
    }
  });

  it("retires only the same-job blog and preserves distinct threshold pages", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "content/blog/cycling-threshold-intervals-guide.mdx",
        ),
      ),
    ).toBe(false);

    expect(read("next.config.ts")).toContain(
      `{ source: "${RETIRED_BLOG}", destination: "${OWNER}", permanent: true }`,
    );

    for (const file of [
      "content/blog/cycling-threshold-power-explained-guide.mdx",
      "content/blog/sweet-spot-vs-threshold-vs-polarised-comparison.mdx",
      "content/podcast/ep-2540-secret-to-improving-threshold-dose-frequency-duration.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), file)), file).toBe(true);
    }

    expect(getAnswerBySlug("improve-threshold-power")).toBeDefined();
    expect(read("src/lib/glossary.ts")).toContain('slug: "threshold"');
  });

  it("repoints active editorial links to the answer owner", () => {
    for (const file of [
      "content/topics/sweet-spot-training.mdx",
      "content/topics/polarised-training.mdx",
      "content/blog/polarised-training-cycling-complete-guide.mdx",
      "content/blog/cycling-threshold-power-explained-guide.mdx",
      "content/blog/cycling-interval-training-beginners.mdx",
      "content/blog/cycling-interval-session-library-guide.mdx",
    ]) {
      const active = read(file);
      expect(active, file).toContain(OWNER);
      expect(active, file).not.toContain(RETIRED_BLOG);
    }

    expect(read("src/lib/topics.ts")).not.toContain(
      '"cycling-threshold-intervals-guide"',
    );
  });

  it("connects author, reviewer, citations, FAQ and entity schema", () => {
    const route = read("src/app/(content)/answers/[slug]/page.tsx");
    for (const signal of [
      "author: { \"@id\": ENTITY_IDS.person }",
      "publisher: { \"@id\": ENTITY_IDS.organization }",
      "dateModified: answer.updatedDate",
      "reviewedBy: { \"@id\": ENTITY_IDS.person }",
      "citation: answer.sources.map",
      '\"@type\": \"FAQPage\"',
    ]) {
      expect(route).toContain(signal);
    }
  });

  it("records GSC evidence and extends AI and recrawl discovery", () => {
    const decision = read(
      "docs/seo/gsc-threshold-interval-owner-2026-08-26.md",
    );
    for (const signal of [
      "117",
      "6.81K",
      "44",
      "2.82K",
      "391",
      "373",
      "18 of the 19 exact-query clicks",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical threshold-interval owner",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `${OWNER} — Canonical cycling threshold-interval owner`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 292,
        prompt:
          "how should I do threshold intervals for cycling and progress from 3x8 to 2x20",
        target_page: OWNER,
      }),
    );
  });
});
