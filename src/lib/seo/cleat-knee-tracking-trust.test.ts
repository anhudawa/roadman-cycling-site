import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/cycling-knee-tracking-cleat-setup-guide.mdx";

describe("cleat-position and knee-tracking search trust", () => {
  const guide = read(GUIDE_PATH);
  const parsed = matter(guide);

  it("publishes a reviewed owner with extractable metadata", () => {
    expect(parsed.data.seoTitle).toBe(
      "Cycling Cleat Position & Knee Tracking Guide",
    );
    expect(parsed.data.updatedDate).toBe("2026-08-25");
    expect(parsed.data.lastReviewed).toBe("2026-08-25");
    expect(parsed.data.reviewedBy).toContain(
      "cited cleat-position, cycling-biomechanics",
    );
    expect(parsed.data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(parsed.data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(parsed.content.match(/^# /gm)).toBeNull();
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(
      60,
    );
    expect(parsed.data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(
      100,
    );
  });

  it("defines distinct ownership from the knee-pain pages", () => {
    expect(guide).toContain(
      "This page owns cleat installation, measurement and knee-tracking observation",
    );
    expect(guide).toContain(
      "That page owns the symptom-checklist intent",
    );
    expect(guide).toContain(
      "/blog/knee-pain-cycling-what-to-check-first",
    );
    expect(guide).toContain("/blog/cycling-knee-pain-causes-fixes");
  });

  it("grounds evidence limits in primary research and official manuals", () => {
    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/39285616/",
      "https://pubmed.ncbi.nlm.nih.gov/29234554/",
      "https://pubmed.ncbi.nlm.nih.gov/35129429/",
      "https://pubmed.ncbi.nlm.nih.gov/32444150/",
      "https://pubmed.ncbi.nlm.nih.gov/39329621/",
      "https://www.lookcycle.com/us-en/products/pedals/road/cleats/cleat-keo-cleat",
      "https://www8.garmin.com/manuals/webhelp/GUID-F384D11E-79B0-4D97-BB69-DD8922C20299/EN-US/GUID-50FC6926-E22A-46B4-9D26-C7E54F49EE75.html",
    ]) {
      expect(guide).toContain(url);
    }
    expect(guide).toContain("no clear general recommendation");
    expect(guide).toContain(
      "Manufacturer pages support component compatibility",
    );
  });

  it("removes universal tracking rules and symptom-to-adjustment claims", () => {
    for (const staleClaim of [
      "Cleat position is the most common cause of cycling knee pain",
      "the kneecap should travel straight over the second toe",
      "Why Knee Tracking Is the Diagnostic That Matters",
      "you've got an overuse injury waiting to announce itself",
      "move the cleat rearward 5mm",
      "Moving cleats 5-10mm rearward",
      "the hallmark of a cleat rotation",
      "It almost always points to cleat rotation",
      "widen the stance with pedal spacers",
      "may need cycling-specific wedges",
      "fixed cleats demand perfection",
      "For the vast majority of amateur riders, float is the right default",
    ]) {
      expect(guide).not.toContain(staleClaim);
    }
  });

  it("records the GSC decision and adds measurement plus recrawl", () => {
    const decision = read(
      "docs/seo/gsc-cleat-knee-tracking-opportunity-2026-08-25.md",
    );
    for (const signal of [
      "1,940 impressions",
      "28 clicks",
      "1.4% CTR",
      "average position 6.3",
      "36 impressions",
      "position of 11.8",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json"));
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 207,
          target_page: "/blog/cycling-knee-tracking-cleat-setup-guide",
        }),
      ]),
    );

    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/blog/cycling-knee-tracking-cleat-setup-guide",
    );
  });
});
