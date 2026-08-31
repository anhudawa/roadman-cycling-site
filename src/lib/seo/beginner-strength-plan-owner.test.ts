import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "cycling-strength-training-12-week-beginner-plan";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const article = matter(read(`content/blog/${SLUG}.mdx`));
const trustedCopy = `${JSON.stringify(article.data)} ${article.content}`;

describe("12-week beginner cyclist strength plan owner", () => {
  it("preserves the established search owner and publishes a direct current answer", () => {
    expect(article.data.seoTitle).toBe(
      "12-Week Strength Training Plan for Cyclists + PDF",
    );
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.lastReviewed).toBe("2026-08-31");
    expect(article.data.reviewedBy).toContain("cited cyclist");
    expect(article.data.evidenceLevel).toBe("emerging");
    expect(article.data.citedClaims).toHaveLength(5);
    expect(article.data.keyTakeaways).toHaveLength(6);
    expect(article.data.faq).toHaveLength(7);
    expect(article.data.answerCapsule).toContain(
      "not the single 12-week protocol proved by a cyclist study",
    );
  });

  it("delivers the adaptable three-phase plan and two complete sessions", () => {
    for (const section of [
      "## The plan in 30 seconds",
      "## Session A",
      "## Session B",
      "## Weeks 1–2: learn and tolerate",
      "## Weeks 3–6: build repeatability",
      "## Weeks 7–12: progress selected movements",
      "## Where to place the sessions",
      "## Readiness: change the dose, not the goal",
    ]) {
      expect(article.content).toContain(section);
    }

    expect(article.content).toContain("**Separate demanding sessions.**");
    expect(article.content).toContain("**Consolidate stress.**");
    expect(article.content).toContain(
      "/downloads/12-week-strength-training-plan-for-cyclists.pdf",
    );
  });

  it("grounds the framework in sources while labelling the evidence boundary", () => {
    for (const pmid of ["40632222", "42410632", "28783467", "23256921"]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(article.content).toContain(
      "No cyclist study has tested this exact two-session, 12-week package",
    );
    expect(article.content).toContain("authors graded the evidence low certainty");
    expect(article.content).toContain("A novice does not need a one-repetition-maximum test");
  });

  it("removes rigid phases, transfer guarantees and injury promises", () => {
    for (const unsupported of [
      "safe and effective for any age",
      "same stimulus without the spinal compression risk",
      "strict order",
      "skip a phase and the next one won't stick",
      "deep stabilisers",
      "single most transferable strength exercise",
      "prevents the injuries",
      "every rider who has skipped",
      "two to three sessions per week is the sweet spot",
      "concurrent training effect means",
      "your floor has risen permanently",
      "Monday, Wednesday, Friday",
      "Jump Split Squat: 3×6",
      "Lateral Bound: 3×8",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });

  it("serves the printable plan requested in Search", () => {
    const pdfPath = path.join(
      ROOT,
      "public/downloads/12-week-strength-training-plan-for-cyclists.pdf",
    );
    expect(fs.existsSync(pdfPath)).toBe(true);
    expect(fs.statSync(pdfPath).size).toBeGreaterThan(10_000);
    expect(article.content).toContain("Download the free 12-week PDF");
  });

  it("routes the plan into tools and the one attributed app waitlist", () => {
    for (const pathname of [
      "/tools/strength-session-planner",
      "/tools/training-readiness",
      "/tools/recovery-screen",
      "/app?source=beginner-strength-plan",
    ]) {
      expect(article.content).toContain(`](${pathname})`);
    }

    expect(read("src/lib/app-acquisition.ts")).toContain(
      '"beginner-strength-plan"',
    );
  });

  it("records the Web and AI baseline and extends discovery measurement", () => {
    const brief = read(
      "docs/seo/gsc-beginner-strength-plan-app-opportunity-2026-08-31.md",
    );
    for (const signal of [
      "111 clicks",
      "3,805 impressions",
      "2.9% CTR",
      "average position 10.3",
      "643 impressions",
      "pdf free download",
    ]) {
      expect(brief).toContain(signal);
    }

    expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${SLUG}`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 350,
        prompt:
          "free 12 week strength training program for beginner cyclists with a printable pdf and bike week placement",
        target_page: `/blog/${SLUG}`,
      }),
    );
  });
});
