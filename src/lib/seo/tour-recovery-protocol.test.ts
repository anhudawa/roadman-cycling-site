import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SLUG = "tour-de-france-recovery-between-stages";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const article = matter(read(`content/blog/${SLUG}.mdx`));
const trustedCopy = `${JSON.stringify(article.data)} ${article.content}`;

describe("Tour de France recovery protocol evidence guide", () => {
  it("owns the broad between-stage intent with a fresh evidence answer", () => {
    expect(article.data.updatedDate).toBe("2026-08-31");
    expect(article.data.seoTitle).toBe(
      "Tour de France Recovery Between Stages: Evidence",
    );
    expect(article.data.answerCapsule).toContain("no universal");
    expect(article.data.keyTakeaways).toHaveLength(6);
    expect(article.data.faq).toHaveLength(6);
  });

  it("anchors the hierarchy to primary evidence and explicit limits", () => {
    for (const pmid of [
      "28919842",
      "29663142",
      "39416507",
      "32426160",
      "33144349",
      "34337408",
      "30845249",
    ]) {
      expect(article.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }

    expect(trustedCopy).toContain("under four hours");
    expect(trustedCopy).toContain("small improvements");
    expect(trustedCopy).toContain("not a diagnosis");
  });

  it("removes unsupported guarantees from retrievable surfaces", () => {
    for (const unsupported of [
      "glycogen resynthesis is 50% faster",
      "window is non-negotiable",
      "most gc contenders",
      "numbers don't lie",
      "pulled from stages",
      "melatonin use is common",
      "scale down perfectly",
      "sleep wins every time",
      "and they work",
    ]) {
      expect(trustedCopy.toLowerCase()).not.toContain(unsupported);
    }
  });

  it("connects all cluster owners without blurring their jobs", () => {
    for (const pathname of [
      "/blog/pogacar-recovery-routine",
      "/podcast/ep-31-5-things-pogacar-always-does-after-a-ride",
      "/podcast/pogacar-tour-de-france-recovery-routine",
    ]) {
      expect(article.content).toContain(`](${pathname})`);
    }
  });

  it("hands practical intent to Roadman tools and one app list", () => {
    for (const pathname of [
      "/tools/fuel-planner",
      "/tools/hydration",
      "/tools/recovery-screen",
      "/tools/training-readiness",
      "/app?source=tour-recovery-protocol",
    ]) {
      expect(article.content).toContain(`](${pathname})`);
    }
  });

  it("records and submits the canonical owner", () => {
    const brief = read(
      "docs/seo/tour-de-france-recovery-protocol-2026-08-31.md",
    );
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(brief).toContain("9,910 impressions");
    expect(brief).toContain("Intent ownership");
    expect(indexNow).toContain(
      `\`https://\${HOST}/blog/${SLUG}\``,
    );
  });
});
