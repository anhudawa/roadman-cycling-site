import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "sweet-spot-training-cycling-guide";
const OWNER_PATH = `/blog/${OWNER}`;
const RETIRED_PATHS = [
  "/blog/cycling-sweet-spot-training-complete-guide",
  "/blog/sweet-spot-training-cyclists-explained",
  "/blog/sweet-spot-training-cycling",
  "/blog/sweet-spot-training-cycling-complete-guide",
  "/answers/sweet-spot-training-explained",
  "/answers/what-is-sweet-spot-training-cycling",
];

describe("sweet spot training search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes one direct, reviewed answer for broad sweet spot intent", () => {
    expect(data.seoTitle).toBe(
      "Sweet Spot Training Cycling: 88–94% FTP Explained",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("training-distribution");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT15M");
    expect(content).toContain("Sweet spot training at a glance");
    expect(content).toContain("How many sweet spot sessions per week?");
    expect(content).toContain("Sweet spot training for masters cyclists");
  });

  it("grounds the convention, FTP, distribution and masters boundaries", () => {
    for (const url of [
      "https://www.trainingpeaks.com/blog/how-to-get-started-training-with-power/",
      "https://pubmed.ncbi.nlm.nih.gov/34304689/",
      "https://pubmed.ncbi.nlm.nih.gov/39788807/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
      "https://pubmed.ncbi.nlm.nih.gov/29863593/",
      "https://pubmed.ncbi.nlm.nih.gov/36640771/",
      "https://pubmed.ncbi.nlm.nih.gov/25880787/",
      "https://pubmed.ncbi.nlm.nih.gov/35050974/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain("The mythology built around it is not");
    expect(content).toContain(
      "That arithmetic is exact; the physiology is not",
    );
    expect(content).toContain(
      "A useful intensity does not need exaggerated certainty",
    );
    expect(content).toContain(
      "Over 40\” is a search category, not a recovery prescription",
    );
    expect(content).toContain("the percentage is not the athlete");
  });

  it("removes universal benefit, frequency, recovery and gain promises", () => {
    for (const staleClaim of [
      "most of threshold's adaptation",
      "90% of the physiological benefit",
      "90% of the training effect",
      "Two to three sessions a week is the ceiling",
      "two sessions a week, not three",
      "48–72 hours between hard days",
      "down week every third week",
      "Run any of these for six to eight weeks",
      "Most riders see measurable FTP improvements within 4-6 weeks",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("retires broad duplicates through permanent redirects", () => {
    for (const filename of [
      "cycling-sweet-spot-training-complete-guide.mdx",
      "sweet-spot-training-cyclists-explained.mdx",
      "sweet-spot-training-cycling.mdx",
      "sweet-spot-training-cycling-complete-guide.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), "content/blog", filename))).toBe(
        false,
      );
    }

    const redirects = read("next.config.ts");
    for (const source of RETIRED_PATHS) {
      expect(redirects).toContain(`source: "${source}"`);
      expect(redirects).toContain(
        `source: "${source}", destination: "${OWNER_PATH}", permanent: true`,
      );
    }

    expect(read("src/lib/answers-data/ftp.ts")).not.toContain(
      'slug: "sweet-spot-training-explained"',
    );
    expect(read("src/lib/answers-data/high-volume-queries-9.ts")).not.toContain(
      'slug: "what-is-sweet-spot-training-cycling"',
    );
  });

  it("routes the glossary entity to the owner and keeps the hub distinct", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain('slug: "sweet-spot"');
    expect(glossary).toContain(`canonicalPath: "${OWNER_PATH}"`);
    expect(glossary).toContain(
      "A cycling coaching convention commonly set at 88–94% of FTP",
    );
    expect(glossary).not.toContain(
      "Delivers a high training stimulus with manageable fatigue",
    );

    const hub = read("content/topics/sweet-spot-training.mdx");
    expect(hub).toContain("Roadman learning path");
    expect(hub).toContain(
      `[Sweet Spot Training for Cycling: 88–94% FTP Explained](${OWNER_PATH})`,
    );
    expect(hub).not.toContain("90% of the training stimulus");
  });

  it("bounds the calculator and interval-builder claims", () => {
    const landing = read("src/lib/tools/landing-content.ts");
    const calculator = read("src/app/(content)/tools/sweet-spot/page.tsx");
    const intervalBuilder = read(
      "src/app/(content)/tools/interval-builder/page.tsx",
    );

    expect(landing).toContain(
      "The 88-94% band is a coaching convention, not a measured physiological threshold",
    );
    expect(landing).toContain("No evidence-backed number fits everyone");
    expect(calculator).toContain("WHAT THE EVIDENCE CAN SUPPORT");
    expect(calculator).toContain(
      'href="/blog/sweet-spot-training-cycling-guide"',
    );
    expect(intervalBuilder).not.toContain(
      "90% of the training effect of full threshold work",
    );
    expect(intervalBuilder).not.toContain(
      "24-36 hours before the next sweet spot",
    );
  });

  it("extends LLM, AI benchmark, recrawl and Search Console measurement", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `${OWNER} — Canonical sweet spot training owner`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 289,
        prompt:
          "what is sweet spot training in cycling and how often should I do it",
        target_page: OWNER_PATH,
      }),
    );

    const decision = read(
      "docs/seo/gsc-sweet-spot-training-consolidation-2026-08-26.md",
    );
    for (const signal of [
      "124",
      "15.9K",
      "sweet spot training",
      "sweet spot cycling",
      "cycling sweet spot training",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
