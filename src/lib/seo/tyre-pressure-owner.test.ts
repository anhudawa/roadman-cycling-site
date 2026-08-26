import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import {
  calculateTyrePressure,
  HOOKLESS_CEILING_PSI,
} from "@/lib/tools/tyre-pressure-calculator";
import { getToolLanding } from "@/lib/tools/landing-content";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("road bike tyre-pressure calculator owner", () => {
  it("returns the disclosed road baseline in PSI and bar", () => {
    const result = calculateTyrePressure({
      riderWeightKg: 75,
      bikeAndGearWeightKg: 8.5,
      measuredTyreWidthMm: 28,
      surface: "smooth",
      setup: "tubed",
      rimProfile: "hooked",
    });

    expect(result).toMatchObject({
      frontPsi: 70,
      rearPsi: 75,
      frontBar: 4.8,
      rearBar: 5.2,
      systemWeightKg: 83.5,
      outsideEnteredLimits: false,
      hooklessCeilingApplied: false,
    });
  });

  it("uses explicit surface factors without an unsupported setup modifier", () => {
    const shared = {
      riderWeightKg: 75,
      bikeAndGearWeightKg: 8.5,
      measuredTyreWidthMm: 28,
      rimProfile: "hooked" as const,
    };
    const roughTubed = calculateTyrePressure({
      ...shared,
      surface: "rough",
      setup: "tubed",
    });
    const roughTubeless = calculateTyrePressure({
      ...shared,
      surface: "rough",
      setup: "tubeless",
    });
    const gravel = calculateTyrePressure({
      ...shared,
      surface: "gravel",
      setup: "tubeless",
    });

    expect(roughTubed).toMatchObject({ frontPsi: 63, rearPsi: 67 });
    expect(roughTubeless).toMatchObject({ frontPsi: 63, rearPsi: 67 });
    expect(gravel).toMatchObject({ frontPsi: 56, rearPsi: 60 });
  });

  it("flags rather than silently clamping an estimate outside system limits", () => {
    const result = calculateTyrePressure({
      riderWeightKg: 75,
      bikeAndGearWeightKg: 8.5,
      measuredTyreWidthMm: 25,
      surface: "smooth",
      setup: "tubeless",
      rimProfile: "hookless",
      systemMaximumPsi: 80,
    });

    expect(result.rearPsi).toBe(92);
    expect(result.effectiveMaximumPsi).toBe(HOOKLESS_CEILING_PSI);
    expect(result.hooklessCeilingApplied).toBe(true);
    expect(result.outsideEnteredLimits).toBe(true);
  });

  it("publishes bounded metadata, visible trust and structured-data content", () => {
    const layout = read("src/app/(content)/tools/tyre-pressure/layout.tsx");
    const page = read("src/app/(content)/tools/tyre-pressure/page.tsx");
    const report = read("src/lib/tools/reports.ts");
    const landing = getToolLanding("tyre-pressure");

    expect(layout).toContain(
      "Road Bike Tyre Pressure Calculator: Front & Rear PSI",
    );
    expect(layout).not.toContain("15% Drop Method");
    expect(page).toContain("ROAD BIKE TYRE PRESSURE CALCULATOR");
    expect(page).toContain("COMPATIBILITY CHECK REQUIRED");
    expect(page).toContain("DO NOT USE THIS ESTIMATE");
    expect(page).toContain("REPORT AND COPY DISABLED");
    expect(page).toContain("PSI · {result.frontBar} bar");
    expect(landing?.dateModified).toBe("2026-08-26");
    expect(landing?.reviewedBy).toBe("Anthony Walsh");
    expect(landing?.evidenceSources).toHaveLength(6);
    expect(landing?.faqs).toHaveLength(6);
    expect(landing?.howToSteps).toHaveLength(6);
    expect(landing?.howItWorks).toContain(
      "rear PSI = 361.6257 × system weight in kg",
    );
    expect(JSON.stringify(landing)).not.toContain("SILCA-grade");
    expect(JSON.stringify(landing)).not.toContain("same logic the WorldTour");
    expect(report).toContain("Compatibility check required");
    expect(report).not.toContain("4-6 psi");
    expect(report).not.toContain("biggest free performance upgrade");
  });

  it("keeps one informational guide and permanently redirects the duplicate", () => {
    const guideRaw = read("content/blog/cycling-tyre-pressure-guide.mdx");
    const { data, content } = matter(guideRaw);
    const redirects = read("next.config.ts");

    expect(data.seoTitle).toBe(
      "Cycling Tyre Pressure Guide: Set and Test Your PSI",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(content).toContain("There is no single best cycling tyre pressure");
    expect(content).toContain("The Roadman v1 starting model");
    expect(guideRaw).toContain("https://www.etrto.org/");
    expect(guideRaw).toContain("https://pubmed.ncbi.nlm.nih.gov/20881880/");
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "content/blog/tyre-pressure-cycling-complete-guide.mdx",
        ),
      ),
    ).toBe(false);
    expect(redirects).toContain(
      '{ source: "/blog/tyre-pressure-cycling-complete-guide", destination: "/blog/cycling-tyre-pressure-guide", permanent: true }',
    );
  });

  it("extends discovery, recrawl, benchmark and measurement controls", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(
      '"cycling-tyre-pressure-guide"',
    );
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "manufacturer-limit checks",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "/blog/cycling-tyre-pressure-guide",
    );
    expect(read("src/app/sitemap.ts")).toContain(
      '/tools/tyre-pressure`, lastModified: new Date("2026-08-26")',
    );

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 243,
        target_page: "/tools/tyre-pressure",
      }),
    );

    const decision = read(
      "docs/seo/gsc-tyre-pressure-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "587 clicks",
      "57,125 impressions",
      "1.0% CTR",
      "average position 8.4",
      "1,000 exposed query rows",
      "1,075 impressions",
      "average position 19.4",
      "3 September 2026",
      "24 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
