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
    expect(read("src/lib/answers-data/high-volume-queries.ts")).not.toContain(
      'slug: "best-tyre-pressure-road-cycling"',
    );
    expect(redirects).toContain(
      '{ source: "/answers/best-tyre-pressure-road-cycling", destination: "/blog/cycling-tyre-pressure-guide", permanent: true }',
    );
  });

  it("consolidates zero-traffic wet answers and removes blanket pressure advice", () => {
    const rain = read("content/blog/cycling-in-rain-guide.mdx");
    const descending = read(
      "content/blog/cycling-descending-wet-conditions-guide.mdx",
    );
    const racing = read("content/blog/cycling-racing-in-the-rain-guide.mdx");
    const braking = read(
      "content/blog/cycling-braking-technique-confidence-guide.mdx",
    );
    const cornering = read(
      "content/blog/cornering-confidence-road-bike-technique.mdx",
    );
    const redirects = read("next.config.ts");
    const answerFiles = [
      "src/lib/answers-data/high-volume-queries-4.ts",
      "src/lib/answers-data/high-volume-queries-8.ts",
      "src/lib/answers-data/high-volume-queries-10.ts",
      "src/lib/answers-data/high-volume-queries-11.ts",
    ]
      .map(read)
      .join("\n");

    expect(answerFiles).not.toContain('slug: "cycling-in-rain-tips-and-gear"');
    expect(answerFiles).not.toContain(
      'slug: "cycling-in-wet-conditions-safety"',
    );
    expect(answerFiles).not.toContain('slug: "how-to-set-up-tubeless-tyres"');
    expect(redirects).toContain(
      '{ source: "/answers/cycling-in-rain-tips-and-gear", destination: "/blog/cycling-in-rain-guide", permanent: true }',
    );
    expect(redirects).toContain(
      '{ source: "/answers/cycling-in-wet-conditions-safety", destination: "/blog/cycling-in-rain-guide", permanent: true }',
    );

    for (const article of [rain, descending, racing, braking, cornering]) {
      const { data } = matter(article);
      expect(data.updatedDate).toBe("2026-08-26");
      expect(data.lastReviewed).toBe("2026-08-26");
      expect(data.reviewedBy).toContain("Anthony Walsh");
      expect(data.citedClaims.length).toBeGreaterThanOrEqual(2);
      expect(article).toContain("1-2 PSI");
    }

    expect(rain).toContain("Bicycle Rolling Resistance");
    expect(descending).toContain("Shimano's road-brake safety guidance");
    expect(racing).toContain("controlled test of three 28mm tyres");
    expect(braking).not.toContain(
      "Drop your tyre pressure by 5-10 psi from your dry setup",
    );

    const tubelessOwner = read(
      "src/lib/answers-data/high-volume-queries-13.ts",
    );
    expect(tubelessOwner).toContain('slug: "how-to-set-up-tubeless-tyres"');
    expect(tubelessOwner).toContain(
      "never exceed the lower maximum for the tyre-rim pair",
    );
    expect(tubelessOwner).not.toContain(
      "Inflate to the tyre's maximum pressure to fully seat",
    );
    expect(tubelessOwner).not.toContain(
      "Typically 10-15 PSI lower than tubed setups",
    );

    const decision = read(
      "docs/seo/gsc-wet-riding-consolidation-2026-08-26.md",
    );
    expect(decision).toContain("0 clicks and 0 impressions");
    expect(decision).toContain("/answers/cycling-in-rain-tips-and-gear");
    expect(decision).toContain("/answers/cycling-in-wet-conditions-safety");
  });

  it("publishes one compatibility-first tubeless comparison without universal claims", () => {
    const raw = read("content/blog/tubeless-vs-clincher-tyres.mdx");
    const { data, content } = matter(raw);
    const answerOwner = read(
      "src/lib/answers-data/high-volume-queries-2.ts",
    );
    const setupOwner = read(
      "src/lib/answers-data/high-volume-queries-13.ts",
    );

    expect(data.seoTitle).toBe(
      "Tubeless vs Clincher Road Tyres: Which Should You Use?",
    );
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("Anthony Walsh");
    expect(data.citedClaims).toHaveLength(4);
    expect(data.faq).toHaveLength(6);
    expect(content).toContain("Compatibility decides whether tubeless is an option");
    expect(content).toContain(
      "https://docs.sram.com/en-US/publications/6s97VpCp9fBhUto8eMea31/UM%20-%20ZIPP%20-%20Road%20Wheels",
    );
    expect(content).toContain(
      "https://www.schwalbe.com/en/technology-faq/tire-dimensions/",
    );
    expect(content).toContain(
      "https://www.bicyclerollingresistance.com/specials/top-3-fastest-tubeless-vs-tubes",
    );
    for (const unsupported of [
      "3-6 watts per tyre",
      "50-70% fewer",
      "30-60ml",
      "fully tubeless",
      "Inflate to the tyre's maximum pressure",
    ]) {
      expect(raw).not.toContain(unsupported);
      expect(answerOwner).not.toContain(unsupported);
    }
    expect(setupOwner).not.toContain(
      "Inflate to the tyre's maximum pressure to fully seat",
    );
    expect(setupOwner).not.toContain(
      "Typically 10-15 PSI lower than tubed setups",
    );
    expect(answerOwner).toContain(
      "Compare complete named systems: casing, tube or sealant",
    );
    expect(setupOwner).toContain(
      "Set up road tubeless tyres safely: verify tyre-rim compatibility",
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
