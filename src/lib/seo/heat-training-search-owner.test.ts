import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { heatAnswers } from "@/lib/answers-data/heat";
import { getTopicsForPost } from "@/lib/topics";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER = "heat-training-cyclists-30-watts-ftp-protocol";
const SUPPORT = [
  "cycling-heat-acclimation-protocol-guide",
  "cycling-heat-performance-adaptation-guide",
  "cycling-heat-illness-prevention-guide",
  "heat-tolerance-ageing-cyclist",
] as const;

describe("heat-training search ownership and trust", () => {
  it("keeps one reviewed broad owner and four distinct specialist pages", () => {
    const owner = matter(read(`content/blog/${OWNER}.mdx`));

    expect(owner.data.seoTitle).toBe(
      "Heat Training for Cyclists: Evidence & Safe Preparation",
    );
    expect(owner.data.updatedDate).toBe("2026-08-26");
    expect(owner.data.lastReviewed).toBe("2026-08-26");
    expect(owner.data.reviewedBy).toContain("Anthony Walsh");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(6);
    expect(owner.content).toContain("## What the performance research actually says");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/39160765/");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/39762944/");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/31191102/");

    const parentTopics = getTopicsForPost(OWNER).map(({ slug }) => slug);
    expect(new Set(parentTopics).size).toBe(parentTopics.length);

    for (const slug of SUPPORT) {
      const article = matter(read(`content/blog/${slug}.mdx`));
      expect(["coaching", "nutrition", "strength", "recovery", "community"]).toContain(
        article.data.pillar,
      );
      expect(article.data.updatedDate).toBe("2026-08-26");
      expect(article.data.lastReviewed).toBe("2026-08-26");
      expect(article.data.reviewedBy).toContain("Anthony Walsh");
      expect(article.data.answerCapsule).toBeTruthy();
      expect(article.data.citedClaims.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("retires broad duplicates with permanent redirects", () => {
    const redirects = read("next.config.ts");
    const retired = [
      "cycling-heat-training-guide",
      "cycling-heat-training-protocol-at-home",
      "heat-training-indoor-trainer-cyclists",
    ];

    for (const slug of retired) {
      expect(existsSync(resolve(root, `content/blog/${slug}.mdx`))).toBe(false);
      expect(redirects).toContain(`source: \"/blog/${slug}\"`);
    }
    expect(redirects.match(
      /destination: "\/blog\/heat-training-cyclists-30-watts-ftp-protocol"/g,
    )).toHaveLength(3);
    expect(redirects).toContain('source: "/answers/cycling-in-hot-weather-safety"');
    expect(redirects).toContain(
      'destination: "/blog/cycling-heat-illness-prevention-guide"',
    );
  });

  it("keeps the answer layer reviewed, linked and evidence bounded", () => {
    expect(heatAnswers).toHaveLength(22);
    expect(new Set(heatAnswers.map((answer) => answer.slug)).size).toBe(22);

    for (const answer of heatAnswers) {
      expect(answer.updatedDate).toBe("2026-08-26");
      expect(answer.reviewedBy).toContain("Anthony Walsh");
      expect(answer.evidenceNote).toBeTruthy();
      expect(answer.faq.length).toBeGreaterThanOrEqual(3);
    }

    const reviewedHeatOwners = new Set([
      "/blog/heat-training-cyclists-30-watts-ftp-protocol",
      "/blog/cycling-heat-acclimation-protocol-guide",
      "/blog/cycling-heat-performance-adaptation-guide",
      "/blog/cycling-heat-illness-prevention-guide",
      "/blog/heat-tolerance-ageing-cyclist",
    ]);
    expect(
      heatAnswers.filter((answer) =>
        answer.relatedTopics.some(({ href }) => reviewedHeatOwners.has(href)),
      ),
    ).toHaveLength(17);

    const source = read("src/lib/answers-data/heat.ts");
    expect(source).not.toContain("documented 30-watt FTP gain");
    expect(source).not.toContain("10–14 sessions of 60–90 minutes");
    expect(source).not.toContain("windows shut");
  });

  it("records the baseline and extends AI and recrawl discovery", () => {
    const decision = read(
      "docs/seo/gsc-heat-training-consolidation-2026-08-26.md",
    );
    expect(decision).toContain("280");
    expect(decision).toContain("9,395");
    expect(decision).toContain("3.0%");
    expect(decision).toContain("6.4");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Heat training and hot-weather cycling",
    );
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER);
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "HEAT_TRAINING_TRUST_CLUSTER",
    );

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 244,
        target_page: `/blog/${OWNER}`,
      }),
    );
  });
});
