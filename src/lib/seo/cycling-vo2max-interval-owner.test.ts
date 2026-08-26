import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-vo2max-intervals";
const RETIRED_BLOGS = [
  "cycling-vo2max-intervals-complete-guide",
  "vo2max-intervals-cycling-session-guide",
];
const RETIRED_ANSWER = "how-to-do-vo2-max-intervals";

describe("cycling VO2max interval search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a current, direct and bounded VO2max interval answer", () => {
    expect(data.seoTitle).toBe("VO2max Intervals Cycling: 4×4, 4×8 & 30/15");
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("interval-format");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT55M");
    expect(content).toContain("which session should you do?");
    expect(content).toContain("4×4 vs 4×8 vs 30/15");
    expect(content).toContain("A four-step progression");
  });

  it("grounds format, adaptation and monitoring boundaries in primary sources", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/17901124/",
      "https://pubmed.ncbi.nlm.nih.gov/39788807/",
      "https://pubmed.ncbi.nlm.nih.gov/17414804/",
      "https://pubmed.ncbi.nlm.nih.gov/21812820/",
      "https://pubmed.ncbi.nlm.nih.gov/24382021/",
      "https://pubmed.ncbi.nlm.nih.gov/40328438/",
      "https://pubmed.ncbi.nlm.nih.gov/42237396/",
      "https://pubmed.ncbi.nlm.nih.gov/30685470/",
      "https://pubmed.ncbi.nlm.nih.gov/39538060/",
      "https://pubmed.ncbi.nlm.nih.gov/40247924/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain("The evidence is frequently misrepresented");
    expect(content).toContain("That does not make 30/15 universally superior");
    expect(content).toContain("It is not a direct scoreboard");
    expect(content).toContain("The percentage is not the athlete");
  });

  it("removes unsupported protocol, frequency and gain guarantees", () => {
    for (const staleClaim of [
      "The most research-validated protocol is the Norwegian 4x4",
      "The 4x4 protocol (4min on / 4min off) is the most research-validated",
      "1-2 sessions per week for 4-8 weeks produces measurable results",
      "Keep pedalling during recovery — don't stop",
      "clears lactate faster",
      "During your [base phase]",
      "the most scientifically validated approach for building VO2max",
      "the block has run its course",
      "5-8 per cent over six weeks",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("permanently consolidates the two blogs and direct answer", () => {
    const redirects = read("next.config.ts");
    for (const slug of RETIRED_BLOGS) {
      expect(existsSync(`content/blog/${slug}.mdx`)).toBe(false);
      expect(redirects).toContain(
        `{ source: "/blog/${slug}", destination: "/blog/${OWNER}", permanent: true }`,
      );
    }
    expect(redirects).toContain(
      `{ source: "/answers/${RETIRED_ANSWER}", destination: "/blog/${OWNER}", permanent: true }`,
    );
    expect(read("src/lib/answers-data/power.ts")).not.toContain(
      `slug: "${RETIRED_ANSWER}"`,
    );

    for (const file of [
      "content/blog/cycling-interval-session-library-guide.mdx",
      "src/lib/answers-data/threshold-intervals-trust-override.ts",
      "content/blog/best-indoor-cycling-workouts-winter.mdx",
      "content/blog/winter-base-training-modern-approach-cycling.mdx",
      "src/lib/topics.ts",
      "src/lib/answers-data/masters.ts",
      "src/lib/answers-data/zone2.ts",
    ]) {
      const active = read(file);
      for (const slug of [...RETIRED_BLOGS, RETIRED_ANSWER]) {
        expect(active, `${file}: ${slug}`).not.toContain(slug);
      }
    }
  });

  it("preserves the narrower Zone 5, masters, diagnostic and measurement jobs", () => {
    for (const slug of [
      "cycling-zone-5-vo2max-intervals-guide",
      "vo2-max-workouts-cyclists-over-40",
      "vo2max-cycling-fixable-reasons-low",
      "vo2max-cycling-what-your-number-means-guide",
    ]) {
      expect(existsSync(`content/blog/${slug}.mdx`), slug).toBe(true);
    }
    expect(
      read("content/blog/cycling-zone-5-vo2max-intervals-guide.mdx"),
    ).toContain(
      "[canonical VO2max interval guide](/blog/cycling-vo2max-intervals)",
    );
  });

  it("corrects the glossary and extends AI and recrawl discovery", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain(
      "The highest rate at which the body can take in, transport and use oxygen",
    );
    expect(glossary).toContain(
      "No single interval protocol or intensity distribution is universally best",
    );
    expect(glossary).not.toContain("elite World Tour riders reach 80-90+");

    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `/blog/${OWNER} — Canonical cycling VO2max-interval guide`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 287,
        prompt:
          "which VO2 max cycling intervals should I do: 4x4, 4x8 or 30/15",
        target_page: `/blog/${OWNER}`,
      }),
    );
  });

  it("records the GSC baseline and protects the measurement cohort", () => {
    const decision = read("docs/seo/gsc-vo2max-interval-owner-2026-08-26.md");
    for (const signal of [
      "1.05K",
      "71.8K",
      "43",
      "1.8K",
      "65",
      "3.81K",
      "19",
      "1.15K",
      "44",
      "474",
      "807",
      "465",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
