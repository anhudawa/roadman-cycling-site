import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const SLUG = "cycling-time-crunched-training-guide";

describe("time-crunched cycling search owner", () => {
  it("owns the five-to-seven-hour educational intent with a reviewed answer", () => {
    const owner = matter(read(`content/blog/${SLUG}.mdx`));

    expect(owner.data.seoTitle).toBe(
      "Time-Crunched Cyclist: Training on 5–7 Hours/Week",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.reviewedBy).toContain("Anthony Walsh");
    expect(owner.data.keywords).toContain("time crunched cyclist");
    expect(owner.data.answerCapsule).toContain(
      "There is no evidence-based rule",
    );
    expect(owner.data.faq).toHaveLength(5);
  });

  it("publishes inspectable sources and evidence boundaries", () => {
    const owner = matter(read(`content/blog/${SLUG}.mdx`));

    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.reviewedSources.length).toBeGreaterThanOrEqual(6);
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/33826121/");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/39888556/");
    expect(owner.content).toContain("https://pubmed.ncbi.nlm.nih.gov/40632222/");
  });

  it("removes universal low-volume prescriptions and indoor conversion claims", () => {
    const source = read(`content/blog/${SLUG}.mdx`);

    expect(source).not.toContain("The structured sessions are non-negotiable");
    expect(source).not.toContain("Never drop: both interval sessions");
    expect(source).not.toContain("45-minute indoor session on a turbo trainer delivers the same");
    expect(source).not.toContain("intensity distribution closer to 60/40");
    expect(source).toContain("There is no defensible universal claim");
  });

  it("links the education owner from both commercial decision pages", () => {
    const segments = read("src/lib/coaching-segments.ts");
    const plans = read("src/app/(marketing)/training-plans/page.tsx");

    expect(segments).toContain(`href: "/blog/${SLUG}"`);
    expect(segments).toContain("no fixed 60/40 or 80/20 rule");
    expect(plans).toContain(`href: "/blog/${SLUG}"`);
  });

  it("extends short AI discovery, benchmark coverage and recrawl submission", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${SLUG}"`);
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${SLUG}"`);

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    for (const id of [338, 339, 340, 341]) {
      expect(benchmark.prompts).toContainEqual(
        expect.objectContaining({ id, target_page: `/blog/${SLUG}` }),
      );
    }
  });
});
