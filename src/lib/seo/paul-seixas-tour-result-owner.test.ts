import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getPostBySlug } from "@/lib/blog";
import { LLMS_PINNED_BLOG_SLUGS } from "@/lib/seo/llms-content";

const SLUG = "paul-seixas-tour-de-france-2026-youngest-contender";
const PATH = `/blog/${SLUG}`;

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Paul Seixas 2026 Tour result owner", () => {
  const post = getPostBySlug(SLUG);
  const source = read(`content/blog/${SLUG}.mdx`);

  it("answers the athlete-result query with the verified final record", () => {
    expect(post).not.toBeNull();
    expect(post).toEqual(
      expect.objectContaining({
        seoTitle: "Paul Seixas Tour de France 2026: Fourth Overall at 19",
        updatedDate: "2026-08-26",
        lastReviewed: "2026-08-26",
      }),
    );
    for (const signal of [
      "fourth overall",
      "74:08:22",
      "11:56",
      "youngest top-five finisher",
      "19 years and 283 days",
      "third on Stages 10 and 14",
      "ended the Tour behind Isaac del Toro",
    ]) {
      expect(post?.answerCapsule).toContain(signal);
    }
  });

  it("adds reviewed claims, FAQs and primary-source boundaries", () => {
    expect(post?.citedClaims).toHaveLength(5);
    expect(post?.faq).toHaveLength(5);
    expect(source).toContain("WHAT THE OFFICIAL RECORD SUPPORTS");
    expect(source).toContain("## Reviewed sources");
    expect(source).toContain("Official Tour de France Stage 21 classification");
    expect(source).toContain("Official Paul Seixas rider profile");
    expect(source).toContain("Official 2026 classification review");
    expect(source).toContain(
      "future potential, private training and psychology",
    );
  });

  it("removes unsupported psychology and Stage 2 gift claims", () => {
    for (const unsupported of [
      "Seixas does not do that. Not yet",
      "attacks without checking his power meter",
      "gifted it to del Toro",
      "Pogacar gifted him the stage",
      "greatest rider in the world",
    ]) {
      expect(source).not.toContain(unsupported);
    }
    expect(source).toContain("What Roadman's original article got wrong");
    expect(source).toContain("That claim has been removed");
  });

  it("records the GSC baseline and aligns AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-paul-seixas-tour-result-opportunity-2026-08-26.md",
    );
    for (const signal of ["12", "1,835", "0.7%", "6.7"]) {
      expect(decision).toContain(signal);
    }

    expect(LLMS_PINNED_BLOG_SLUGS.has(SLUG)).toBe(true);
    expect(read("src/app/llms.txt/route.ts")).toContain(PATH);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(PATH);
    expect(read("scripts/submit-indexnow.ts")).toContain(PATH);
    expect(read("src/app/tour-de-france/page.tsx")).toContain(
      `href="${PATH}"`,
    );

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 284, target_page: PATH }),
    );
  });
});
