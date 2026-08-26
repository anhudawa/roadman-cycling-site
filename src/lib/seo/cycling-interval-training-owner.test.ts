import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-interval-training-beginners";
const RETIRED = "cycling-interval-sessions-complete-guide";
const LIBRARY = "cycling-interval-session-library-guide";

describe("cycling interval training search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a current, direct and bounded interval-training answer", () => {
    expect(data.seoTitle).toBe(
      "Cycling Interval Training: Beginner Workouts & Progression",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("interval design");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT50M");
    expect(content).toContain("Cycling intervals in 30 seconds");
    expect(content).toContain("Four cycling interval workouts that scale");
    expect(content).toContain("A four-week beginner progression");
  });

  it("grounds benefit, intensity, progression and warm-up boundaries in evidence", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/39788807/",
      "https://pubmed.ncbi.nlm.nih.gov/39830026/",
      "https://pubmed.ncbi.nlm.nih.gov/39538060/",
      "https://pubmed.ncbi.nlm.nih.gov/23620244/",
      "https://pubmed.ncbi.nlm.nih.gov/42237396/",
      "https://pubmed.ncbi.nlm.nih.gov/41740126/",
      "https://pubmed.ncbi.nlm.nih.gov/40247924/",
      "https://pubmed.ncbi.nlm.nih.gov/16177615/",
      "https://pubmed.ncbi.nlm.nih.gov/36281325/",
      "https://pubmed.ncbi.nlm.nih.gov/30685470/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain(
      "The evidence supports interval training as a useful tool",
    );
    expect(content).toContain("There is no validated rule");
    expect(content).toContain("Change one variable at a time");
    expect(content).toContain("Warm-up and cool-down without mythology");
  });

  it("removes unsupported readiness, frequency and benefit guarantees", () => {
    for (const staleClaim of [
      "After 6-8 weeks of consistent riding",
      "Never exceed two hard sessions per week",
      "delivers 90% of threshold training benefit",
      "That progression has never failed anyone",
      "intervals are almost certainly the missing ingredient",
      "intervals will transform your riding within weeks",
      "it helps clear metabolic byproducts",
      "Every interval session follows the same framework",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("consolidates the duplicate and preserves the distinct workout library", () => {
    expect(existsSync(`content/blog/${RETIRED}.mdx`)).toBe(false);
    const redirects = read("next.config.ts");
    expect(redirects).toContain(
      `{ source: "/blog/${RETIRED}", destination: "/blog/${OWNER}", permanent: true }`,
    );

    const libraryRaw = read(`content/blog/${LIBRARY}.mdx`);
    const library = matter(libraryRaw);
    expect(library.data.seoTitle).toContain("15 Workouts");
    expect(libraryRaw).toContain(
      `[cycling interval training guide](/blog/${OWNER})`,
    );
    expect(libraryRaw).not.toContain(`/blog/${RETIRED}`);

    for (const file of [
      "content/blog/best-indoor-cycling-workouts-winter.mdx",
      "content/blog/cycling-energy-systems-explained-guide.mdx",
      "content/blog/improve-ftp-cycling-evidence-based-methods.mdx",
      "src/lib/answers-data/high-volume-queries-2.ts",
    ]) {
      expect(read(file)).not.toContain(`/blog/${RETIRED}`);
    }
  });

  it("keeps the glossary definition concise and routes it to the broad owner", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain(
      "Planned work periods separated by easier recovery",
    );
    expect(glossary).toContain(`relatedArticle: "/blog/${OWNER}"`);
    expect(glossary).not.toContain(
      "The primary method for building VO2max, threshold, and anaerobic capacity",
    );
  });

  it("extends LLM, AI benchmark and recrawl discovery", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `/blog/${OWNER} — Canonical cycling interval-training guide`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 286,
        prompt:
          "how should a beginner start cycling interval training and progress safely",
        target_page: `/blog/${OWNER}`,
      }),
    );
    const intervalPrompts = prompts.prompts.filter((prompt) =>
      [179, 186, 286].includes(prompt.id),
    );
    expect(intervalPrompts).toHaveLength(3);
    expect(
      intervalPrompts.every(
        (prompt) => prompt.target_page === `/blog/${OWNER}`,
      ),
    ).toBe(true);
    expect(JSON.stringify(prompts)).not.toContain(`/blog/${RETIRED}`);
  });

  it("records the GSC baseline and protects the measurement cohort", () => {
    const decision = read(
      "docs/seo/gsc-cycling-interval-training-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "224",
      "15.1K",
      "197",
      "8",
      "1.1K",
      "29",
      "3.52K",
      "1,250",
      "373",
      "535",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
