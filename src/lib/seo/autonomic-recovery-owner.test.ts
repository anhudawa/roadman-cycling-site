import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "cycling-autonomic-nervous-system-recovery-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const article = matter(read(`content/blog/${SLUG}.mdx`));

describe("autonomic recovery cycling search owner", () => {
  it("keeps a reviewed evidence-bounded owner", () => {
    expect(article.data.seoTitle).toBe(
      "Autonomic Recovery for Cyclists: What Actually Helps",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.evidenceLevel).toBe("moderate");
    expect(article.data.citedClaims).toHaveLength(8);
    expect(article.data.faq).toHaveLength(8);
  });

  it("answers physiology, HRV, breathing, cold, age and safety intent", () => {
    for (const answer of [
      "Your autonomic-recovery decision in 60 seconds",
      "What the autonomic nervous system actually does",
      "Parasympathetic reactivation: useful marker, limited conclusion",
      "Does HRV show whether you are stuck in stress mode?",
      "Can HRV-guided training make you faster?",
      "A post-ride routine that does not overpromise",
      "Use slow breathing for the right job",
      "Cold water and face immersion: marker change is not risk-free recovery",
      "Does age change autonomic recovery?",
      "Autonomic overload, overreaching and overtraining are not synonyms",
      "Where autonomic recovery fits in the Roadman app",
    ]) {
      expect(article.content).toContain(answer);
    }
  });

  it("cites direct autonomic, HRV, breathing, age and safety evidence", () => {
    for (const pmid of [
      "18620464",
      "37754676",
      "38873876",
      "26888648",
      "33533045",
      "34639599",
      "36630953",
      "35167847",
      "39918163",
      "22547634",
      "30945205",
      "23247672",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported nervous-system promises and protocols", () => {
    const trusted = `${JSON.stringify(article.data)}\n${article.content}`.toLowerCase();
    for (const unsupported of [
      "adaptation happens during parasympathetic dominance",
      "the switch between these two states is not automatic",
      "direct measurement of parasympathetic activity",
      "the nervous system does not lie",
      "shifts autonomic balance within 60 seconds",
      "one cycle produces measurable cortisol reduction",
      "the most reliable acute vagal stimulus available",
      "a 60-day mean",
      "more than one standard deviation below",
      "two, three, or four hours",
      "mouth breathing is associated with sympathetic activation",
      "eating tells the nervous system",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("keeps HRV intent with the separate measurement owner", () => {
    expect(article.content).toContain(
      "](/blog/cycling-hrv-training-guide)",
    );
    expect(read("content/blog/cycling-hrv-training-guide.mdx")).toContain(
      SLUG,
    );
  });

  it("routes app interest into the single attributed audience", () => {
    expect(article.content).toContain(
      "](/app?source=autonomic-recovery-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"autonomic-recovery-guide"',
    );
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-autonomic-recovery-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-autonomic-recovery-refresh-2026-08-31.md");
    for (const signal of ["8", "924", "0.9%", "11.3", "165", "prompt 369"]) {
      expect(brief).toContain(signal);
    }
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${SLUG}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${SLUG}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 369, target_page: `/blog/${SLUG}` }),
    );
  });
});
