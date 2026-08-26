import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { LLMS_PINNED_BLOG_SLUGS } from "./llms-content";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const JOE_SLUG = "joe-friel-perfect-cycling-training-week";
const DYLAN_SLUG = "dylan-johnson-oscillation-training-plan";
const DAN_SLUG = "dan-lorang-amateur-training-plan";

const joeSource = read(`content/blog/${JOE_SLUG}.mdx`);
const dylanSource = read(`content/blog/${DYLAN_SLUG}.mdx`);
const danSource = read(`content/blog/${DAN_SLUG}.mdx`);
const joe = matter(joeSource);
const dylan = matter(dylanSource);
const dan = matter(danSource);

describe("training expert child-page trust", () => {
  it("makes Joe Friel's page a reviewed transcript guide", () => {
    expect(joe.data.title).toBe(
      "Joe Friel's Cycling Training Week: What He Actually Said",
    );
    expect(joe.data.seoTitle).toBe(
      "Joe Friel Cycling Training Plan: Transcript Guide",
    );
    expect(joe.data.primaryHub).toBe("cycling-training-plans");
    expect(joe.data.updatedDate).toBe("2026-08-26");
    expect(joe.data.lastReviewed).toBe("2026-08-26");
    expect(joe.data.reviewedBy).toContain("Roadman transcript");
    expect(joe.data.answerCapsule).toContain(
      "did not prescribe one perfect cycling week",
    );

    for (const phrase of [
      "## Source boundary",
      "## What Friel actually said",
      "there was no perfect answer for everybody",
      "The transcript does not support that attribution",
      "## The nine-day-cycle example",
      "## Corrections from the previous version",
      "pubmed.ncbi.nlm.nih.gov/36640771",
      "pubmed.ncbi.nlm.nih.gov/39888556",
    ]) {
      expect(joeSource).toContain(phrase);
    }
  });

  it("removes the unsupported universal Friel plan", () => {
    for (const staleClaim of [
      "Perfect Cycling Training Plan: Joe Friel's Proven Method",
      "80/20 rule applies to everyone",
      "roughly 5 hours easy, 1 hour moderately hard",
      "The answer is always no during base",
      "Walking counts as training",
      "Pick one A-priority event maximum",
      "provides better recovery patterns",
    ]) {
      expect(joeSource).not.toContain(staleClaim);
    }
  });

  it("makes Dylan Johnson's page an explicitly bounded 2025 N=1", () => {
    expect(dylan.data.title).toBe(
      "Dylan Johnson's 2025 Oscillation Training Experiment",
    );
    expect(dylan.data.seoTitle).toBe(
      "Dylan Johnson Oscillation Training: 2025 Experiment",
    );
    expect(dylan.data.primaryHub).toBe("cycling-training-plans");
    expect(dylan.data.updatedDate).toBe("2026-08-26");
    expect(dylan.data.lastReviewed).toBe("2026-08-26");
    expect(dylan.data.reviewedBy).toContain("April 2025 Roadman transcript");
    expect(dylan.data.answerCapsule).toContain("not the gold standard");
    expect(dylan.data.answerCapsule).toContain("elite N=1 hypothesis");

    for (const phrase of [
      "## Johnson's own caveat",
      "the target season had not started",
      "## What the block-periodisation evidence says",
      "## Why there is no amateur oscillation template here",
      "## Corrections from the previous version",
      "pubmed.ncbi.nlm.nih.gov/31802956",
      "pubmed.ncbi.nlm.nih.gov/36640771",
    ]) {
      expect(dylanSource).toContain(phrase);
    }
  });

  it("removes the fabricated amateur translation and stale child claims", () => {
    for (const staleClaim of [
      "Head of Performance, Red Bull–Bora-Hansgrohe",
      "Two structured intensity days per week held through both",
      "14 to 18 hour week alternating with a 6 to 8 hour week",
      "The principle is the same. The numbers scale",
      "The amateur translation is direct",
      "The transferable adaptation to race-day sprinting is significantly higher",
      "pick two A-races",
    ]) {
      expect(dylanSource).not.toContain(staleClaim);
    }
    expect(dan.data.primaryHub).toBe("cycling-training-plans");
    expect(dan.data.updatedDate).toBe("2026-08-26");
    expect(dan.data.experts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Dan Lorang",
          role: "Head of Performance, Lidl-Trek; elite endurance coach",
        }),
      ]),
    );
  });

  it("publishes the child cluster to discovery and measurement surfaces", () => {
    for (const slug of [JOE_SLUG, DYLAN_SLUG]) {
      expect(LLMS_PINNED_BLOG_SLUGS.has(slug)).toBe(true);
      expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${slug}`);
      expect(read("src/app/llms.txt/route.ts")).toContain(`/blog/${slug}`);
      expect(read("src/app/llms-full.txt/route.ts")).toContain(`/blog/${slug}`);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 266, target_page: `/blog/${JOE_SLUG}` }),
        expect.objectContaining({
          id: 267,
          target_page: `/blog/${DYLAN_SLUG}`,
        }),
      ]),
    );

    const decision = read(
      "docs/seo/training-expert-child-page-boundaries-2026-08-26.md",
    );
    for (const signal of [
      "44 clicks, 3,294 impressions",
      "1 click / 49 impressions",
      "12 clicks / 53 impressions",
      "5 September 2026",
      "26 September 2026",
      "Do not merge or redirect child URLs",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
