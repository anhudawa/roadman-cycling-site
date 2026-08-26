import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "polarised-training-cycling-complete-guide";
const OWNER_PATH = `/blog/${OWNER}`;
const RETIRED_PATHS = [
  "/blog/polarised-training-cycling-guide",
  "/answers/what-is-polarised-training",
];

describe("polarised training search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes one reviewed answer for broad polarised-training intent", () => {
    expect(data.seoTitle).toBe(
      "Polarised Training Cycling: 80/20 Model Explained",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("cyclist training-distribution");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(105);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT20M");
    expect(content).toContain("Polarised training at a glance");
    expect(content).toContain("Is 80/20 measured by time or sessions?");
    expect(content).toContain("Does polarised training work better?");
  });

  it("grounds the model, quantification and comparative boundaries", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/16430681/",
      "https://pubmed.ncbi.nlm.nih.gov/20861519/",
      "https://pubmed.ncbi.nlm.nih.gov/37964776/",
      "https://pubmed.ncbi.nlm.nih.gov/29863593/",
      "https://pubmed.ncbi.nlm.nih.gov/38717713/",
      "https://pubmed.ncbi.nlm.nih.gov/39788807/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
      "https://pubmed.ncbi.nlm.nih.gov/36640771/",
      "https://pubmed.ncbi.nlm.nih.gov/41169886/",
    ]) {
      expect(raw).toContain(url);
    }

    for (const boundary of [
      "The popular shorthand is “80% easy, 20% hard.”",
      "The results are not interchangeable",
      "Moderate training is not an empty physiological space",
      "Start with an audit, not a ratio",
      "A perfect pie chart with declining performance is not success",
      "predominantly low intensity, carefully applied high intensity",
    ]) {
      expect(content).toContain(boundary);
    }
  });

  it("removes rigid ratios, universal superiority and grey-zone absolutes", () => {
    for (const staleClaim of [
      "the most effective framework for getting faster",
      "The stuff in between does neither particularly well",
      "produces minimal adaptation",
      "Don't add a third hard day",
      "Two quality sessions per week is enough for most amateurs",
      "more than 10% in Zone 3",
      "Polarised tends to produce better long-term results",
      "produces the most durable fitness",
      "noticeable improvement within 6-8 weeks",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("retires the duplicate guide and answer through permanent redirects", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "content/blog/polarised-training-cycling-guide.mdx",
        ),
      ),
    ).toBe(false);

    const answers = read("src/lib/answers-data/training-physiology.ts");
    expect(answers).not.toContain('slug: "what-is-polarised-training"');

    const redirects = read("next.config.ts");
    for (const source of RETIRED_PATHS) {
      expect(redirects).toContain(
        `source: "${source}", destination: "${OWNER_PATH}", permanent: true`,
      );
    }
  });

  it("routes the glossary entity to the owner and keeps the hub distinct", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain('slug: "polarised-training"');
    expect(glossary).toContain(`canonicalPath: "${OWNER_PATH}"`);
    expect(glossary).toContain(
      "The popular 80/20 shorthand is descriptive, not a universal weekly prescription",
    );

    const hub = read("content/topics/polarised-training.mdx");
    expect(hub).toContain("Roadman learning path");
    expect(hub).toContain(
      `[Polarised Training for Cycling: The 80/20 Model Explained](${OWNER_PATH})`,
    );
    expect(hub).toContain("navigation hub, not a second complete definition");
    expect(hub).not.toContain("most effective framework");
  });

  it("preserves focused comparison and elite-prescription owners", () => {
    for (const path of [
      "src/lib/answers-data/periodisation.ts",
      "content/blog/polarised-vs-sweet-spot-training.mdx",
      "content/blog/polarised-training-cycling-world-tour-prescription.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), path)), path).toBe(true);
    }
    expect(read("src/lib/answers-data/periodisation.ts")).toContain(
      'slug: "polarised-or-pyramidal-training"',
    );
  });

  it("extends LLM, AI benchmark, recrawl and Search Console measurement", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `${OWNER} — Canonical polarised-training owner`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 290,
        prompt:
          "what is polarised training for cycling and does 80/20 mean sessions or time in zone",
        target_page: OWNER_PATH,
      }),
    );

    const decision = read(
      "docs/seo/gsc-polarised-training-consolidation-2026-08-26.md",
    );
    for (const signal of [
      "3.25K",
      "2.04K",
      "polarised training cycling",
      "polarized training cycling",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
