import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const SLUG = "cycling-vitamin-d-performance-guide";

describe("vitamin D cycling search owner and medical trust", () => {
  it("answers the high-impression best-product intent without inventing a cycling dose", () => {
    const parsed = matter(read(`content/blog/${SLUG}.mdx`));

    expect(parsed.data.seoTitle).toBe(
      "Best Vitamin D for Cyclists (2026): Dose & Testing",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-31");
    expect(parsed.data.lastReviewed).toBe("2026-08-31");
    expect(parsed.data.reviewedBy).toContain("Anthony Walsh");
    expect(parsed.data.answerCapsule).toContain(
      "The best vitamin D for a cyclist is not a cycling-specific brand",
    );
    expect(parsed.data.answerCapsule).toContain("400 IU");
    expect(parsed.data.answerCapsule).toContain(
      "upper limit of 4,000 IU is a safety ceiling, not a target",
    );
    expect(parsed.data.keywords).toContain("best vitamin d for cyclists");
    expect(parsed.data.faq).toHaveLength(6);
  });

  it("publishes inspectable sources and evidence boundaries", () => {
    const parsed = matter(read(`content/blog/${SLUG}.mdx`));

    expect(parsed.data.evidenceLevel).toBe("emerging");
    expect(parsed.data.citedClaims).toHaveLength(6);
    expect(parsed.data.reviewedSources.length).toBeGreaterThanOrEqual(7);
    for (const claim of parsed.data.citedClaims) {
      expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
        claim.evidenceLevel,
      );
      expect(claim.evidenceSource.length).toBeGreaterThan(20);
      expect(claim.practicalImplication.length).toBeGreaterThan(20);
    }

    for (const source of parsed.data.reviewedSources) {
      expect(source.href).toMatch(/^https:\/\//);
      expect(source.publisher.length).toBeGreaterThan(2);
    }

    expect(parsed.content).toContain(
      "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
    );
    expect(parsed.content).toContain(
      "https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/",
    );
    expect(parsed.content).toContain("https://pubmed.ncbi.nlm.nih.gov/37841405/");
    expect(parsed.content).toContain(
      "https://www.ukad.org.uk/athletes/managing-supplement-risks",
    );
  });

  it("keeps the retired unsafe blanket protocol out of the owner", () => {
    const source = read(`content/blog/${SLUG}.mdx`);

    for (const retiredClaim of [
      "Supplement 1,000-4,000 IU",
      "4,000-6,000 IU daily for 8-12 weeks",
      "Vitamin K2 (MK-7 form, 100-200 mcg)",
      "Magnesium glycinate 200-400mg",
      "toxicity is rare at doses below 10,000 IU",
      "test in February/March and September/October",
    ]) {
      expect(source).not.toContain(retiredClaim);
    }
    expect(source).toContain("An upper limit is");
    expect(source).toContain("not a do-it-yourself cycling protocol");
  });

  it("renders reviewed references and extends recrawl and AI discovery", () => {
    expect(read("src/lib/blog.ts")).toContain(
      "reviewedSources?: ReviewedSource[]",
    );
    expect(read("src/app/(content)/blog/[slug]/page.tsx")).toContain(
      "reviewedSources={post.reviewedSources}",
    );
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${SLUG}"`);
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "VITAMIN_D_TRUST_CLUSTER",
    );

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    for (const id of [334, 335, 336, 337]) {
      expect(benchmark.prompts).toContainEqual(
        expect.objectContaining({ id, target_page: `/blog/${SLUG}` }),
      );
    }
  });
});
