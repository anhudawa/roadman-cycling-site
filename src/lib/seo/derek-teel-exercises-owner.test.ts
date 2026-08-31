import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "derek-teel-best-exercises-cyclists";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const article = matter(read(`content/blog/${SLUG}.mdx`));
const trustedCopy = `${JSON.stringify(article.data)} ${article.content}`;

describe("Derek Teel best exercises owner", () => {
  it("preserves the established query while publishing a current direct answer", () => {
    expect(article.data.seoTitle).toContain("Best Exercises for Cyclists");
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.reviewedBy).toContain("full Derek Teel episode transcript");
    expect(article.data.evidenceLevel).toBe("emerging");
    expect(article.data.citedClaims).toHaveLength(5);
    expect(article.data.keyTakeaways).toHaveLength(6);
    expect(article.data.faq).toHaveLength(6);
    expect(article.data.answerCapsule).toContain("No study ranks one universal list");
  });

  it("corrects the invented interview attribution and separates evidence layers", () => {
    expect(trustedCopy).toContain("did not contain that ranking");
    expect(article.content).toContain("## What Derek Teel actually said");
    expect(article.content).toContain("## What the cyclist evidence supports");
    expect(article.content).toContain("## Claims this page no longer makes");
    expect(article.content).toContain(
      "/podcast/ep-2091-the-best-exercises-for-cyclists-strength-training",
    );

    for (const pmid of ["40632222", "42410632", "28783467", "33751469"]) {
      expect(article.content).toContain(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`);
    }
  });

  it("removes unsupported exercise, transfer and injury guarantees", () => {
    for (const unsupported of [
      "Teel anchors his cyclist programmes around three exercises",
      "single-leg work is not optional",
      "at least 50% of lower-body gym volume",
      "same stimulus, far lower injury exposure",
      "directly to force production on the pedal",
      "prevents the injuries",
      "Two sessions per week is the floor",
      "two sessions per week is the minimum effective dose",
      "three gym sessions per week during base phases",
      "same posterior-chain and quad stimulus at a fraction",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("provides an adaptable exercise and duration framework", () => {
    for (const section of [
      "## How to choose the best knee-dominant exercise",
      "## How to choose the best hip-dominant exercise",
      "## Is single-leg work more cycling-specific?",
      "### 30 minutes: minimum useful menu",
      "### 45 minutes: balanced full-body session",
      "### 60 minutes: only when the week can absorb it",
    ]) {
      expect(article.content).toContain(section);
    }
  });

  it("routes the high-visibility owner into tools, canonical guides and one app list", () => {
    for (const pathname of [
      "/blog/cycling-gym-exercises-best",
      "/blog/cycling-strength-training-guide",
      "/tools/strength-session-planner",
      "/tools/training-readiness",
      "/tools/recovery-screen",
      "/app?source=derek-teel-exercises",
    ]) {
      expect(article.content).toContain(`](${pathname})`);
    }

    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"derek-teel-exercises"',
    );
  });

  it("records Search and AI baselines and adds the benchmark prompt", () => {
    const brief = read(
      "docs/seo/gsc-derek-teel-exercises-trust-app-2026-08-31.md",
    );
    for (const signal of [
      "144 clicks",
      "9,747 impressions",
      "1.5% CTR",
      "average position 8.6",
      "1,825 impressions",
      "best exercises for cyclists",
    ]) {
      expect(brief).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 349,
        target_page: `/blog/${SLUG}`,
      }),
    );
  });

  it("keeps the owner in IndexNow and LLM discovery", () => {
    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${SLUG}`);
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${SLUG}"`);
  });
});
