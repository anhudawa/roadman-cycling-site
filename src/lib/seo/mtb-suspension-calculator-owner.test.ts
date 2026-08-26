import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FORK_PROFILES,
  REAR_PROFILES,
  calculateSuspensionSetup,
  type ForkProfileId,
} from "@/lib/tools/mtb-suspension";
import { getToolLanding } from "@/lib/tools/landing-content";
import { generateToolReport } from "@/lib/tools/reports";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const baseline = {
  bodyWeightKg: 77,
  kitWeightKg: 3,
  forkProfileId: "fox-38-float-2026" as const,
  forkTravelMm: 170,
  forkSagPercent: 20,
  rearProfileId: "fox-float-x-sl-evol-2026" as const,
  rearStrokeMm: 55,
  rearSagPercent: 30,
};

describe("MTB suspension calculator search owner", () => {
  it("matches a dressed rider to the direct FOX 38 band and calculates sag", () => {
    const result = calculateSuspensionSetup(baseline);

    expect(result).toMatchObject({
      bodyWeightKg: 77,
      ridingWeightKg: 80,
      bodyWeightLb: 169.8,
      ridingWeightLb: 176.4,
      fork: {
        startingPsi: 93,
        pressureStatus: "official-chart",
        sourceBand: "170–180 lb",
        maximumPsi: 140,
        sagPercent: 20,
        sagMm: 34,
      },
      rear: {
        startingPsi: 170,
        pressureStatus: "official-starting-method",
        maximumPsi: 350,
        sagPercent: 30,
        sagMm: 16.5,
      },
    });
  });

  it("does not interpolate or extrapolate the published FOX 38 chart", () => {
    const metricLowerEdge = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 54,
      kitWeightKg: 0,
    });
    const belowMetricLowerEdge = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 53.9,
      kitWeightKg: 0,
    });
    const lowBand = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 125 / 2.2046226218,
      kitWeightKg: 0,
    });
    const highBand = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 130 / 2.2046226218,
      kitWeightKg: 0,
    });
    const outside = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 251 / 2.2046226218,
      kitWeightKg: 0,
    });

    expect(metricLowerEdge.fork).toMatchObject({
      startingPsi: 72,
      pressureStatus: "official-chart",
      sourceBand: "120–130 lb",
    });
    expect(belowMetricLowerEdge.fork).toMatchObject({
      startingPsi: null,
      pressureStatus: "outside-chart",
    });
    expect(lowBand.fork.startingPsi).toBe(72);
    expect(lowBand.fork.sourceBand).toBe("120–130 lb");
    expect(highBand.fork.startingPsi).toBe(76);
    expect(highBand.fork.sourceBand).toBe("130–140 lb");
    expect(outside.fork).toMatchObject({
      startingPsi: null,
      pressureStatus: "outside-chart",
    });
  });

  it("keeps every published FOX 38 value inside the selected maximum", () => {
    const exactProfiles = FORK_PROFILES
      .map((profile) => profile.id)
      .filter((id): id is ForkProfileId => id.startsWith("fox-38-"));

    for (const forkProfileId of exactProfiles) {
      for (let riderLb = 125; riderLb <= 245; riderLb += 10) {
        const result = calculateSuspensionSetup({
          ...baseline,
          bodyWeightKg: riderLb / 2.2046226218,
          kitWeightKg: 0,
          forkProfileId,
        });
        expect(result.fork.startingPsi).not.toBeNull();
        expect(result.fork.startingPsi).toBeLessThanOrEqual(result.fork.maximumPsi!);
      }
    }
  });

  it("limits exact 2026 FOX 38 profiles to the documented travel range", () => {
    const exactProfiles = FORK_PROFILES.filter((profile) => profile.id.startsWith("fox-38-"));

    expect(exactProfiles).toHaveLength(4);
    expect(exactProfiles.every((profile) =>
      profile.travelRangeMm?.min === 130 && profile.travelRangeMm.max === 180,
    )).toBe(true);

    const page = read("src/app/(content)/tools/shock-pressure/page.tsx");
    expect(page).toContain("const forkTravelMin = selectedFork.travelRangeMm?.min ?? 80");
    expect(page).toContain("min={forkTravelMin}");
    expect(page).toContain("max={forkTravelMax}");
  });

  it("withholds unsupported air and coil estimates and guards maximum pressure", () => {
    const rockShox = calculateSuspensionSetup({
      ...baseline,
      forkProfileId: "rockshox",
      rearProfileId: "rockshox-air",
    });
    const coil = calculateSuspensionSetup({
      ...baseline,
      rearProfileId: "coil",
    });
    const overMaximum = calculateSuspensionSetup({
      ...baseline,
      bodyWeightKg: 160,
      kitWeightKg: 3,
      rearProfileId: "fox-float-x2-2026",
    });

    expect(rockShox.fork).toMatchObject({ startingPsi: null, pressureStatus: "lookup-required" });
    expect(rockShox.rear).toMatchObject({ startingPsi: null, pressureStatus: "lookup-required" });
    expect(coil.rear).toMatchObject({ startingPsi: null, pressureStatus: "coil" });
    expect(overMaximum.rear).toMatchObject({
      startingPsi: null,
      pressureStatus: "over-maximum",
      maximumPsi: 350,
    });
  });

  it("publishes exact source profiles and bounded landing-page trust", () => {
    const landing = getToolLanding("shock-pressure");
    const page = read("src/app/(content)/tools/shock-pressure/page.tsx");
    const layout = read("src/app/(content)/tools/shock-pressure/layout.tsx");
    const report = read("src/lib/tools/reports.ts");

    expect(FORK_PROFILES).toHaveLength(7);
    expect(REAR_PROFILES).toHaveLength(6);
    expect(layout).toContain("MTB Suspension Calculator: Fork & Shock Pressure + Sag");
    expect(page).toContain("PRESSURE STARTS IT. SAG DECIDES IT.");
    expect(page).toContain("Independent calculator; not affiliated with FOX, SRAM or RockShox");
    expect(page).toContain('href="/tools/tyre-pressure"');
    expect(page).not.toContain("calculateMtbTyrePressure");
    expect(page).not.toContain("rearMult");
    expect(page).not.toContain("forkMult");
    expect(page).not.toContain("volumeSpacers");
    expect(page).not.toContain("SHOCK_BRANDS");
    expect(report).not.toContain("Bike park / shuttle days");
    expect(report).not.toContain("drop 1–2 psi front tyre");
    expect(landing?.title).toBe("MTB Suspension Calculator");
    expect(landing?.dateModified).toBe("2026-08-26");
    expect(landing?.reviewedBy).toBe("Anthony Walsh");
    expect(landing?.evidenceSources).toHaveLength(5);
    expect(landing?.faqs).toHaveLength(7);
    expect(landing?.webAppFeatures).toHaveLength(5);
    expect(JSON.stringify(landing)).not.toContain("known PSI/kg curves");
    expect(JSON.stringify(landing)).not.toContain("standard load-deflection equation");
  });

  it("generates a sag-first report without generic trail or damping prescriptions", () => {
    const report = generateToolReport("shock-pressure", {
      bodyWeightKg: 77,
      ridingWeightKg: 80,
      forkLabel: "FOX 38 FLOAT (2026)",
      forkStartingPsi: 93,
      forkPressureStatus: "official-chart",
      forkSagPercent: 20,
      forkSagMm: 34,
      rearLabel: "FOX FLOAT X / FLOAT SL EVOL (2026)",
      rearStartingPsi: 170,
      rearPressureStatus: "official-starting-method",
      rearSagPercent: 30,
      rearSagMm: 16.5,
    });

    expect(report?.subject).toBe("Your source-aware MTB suspension setup");
    expect(report?.html).toContain("93 PSI start");
    expect(report?.html).toContain("34 mm at 20% sag");
    expect(report?.html).toContain("170 PSI start");
    expect(report?.html).toContain("16.5 mm at 30% sag");
    expect(report?.html).toContain("Manufacturer and bicycle instructions override this report");
    expect(report?.html).not.toContain("Bike park / shuttle days");
    expect(report?.html).not.toContain("faster rebound");
  });

  it("keeps the owner explicit in search and AI discovery", () => {
    const shortLlms = read("src/app/llms.txt/route.ts");
    const fullLlms = read("src/app/llms-full.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const decision = read("docs/seo/gsc-mtb-suspension-calculator-owner-2026-08-26.md");
    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(shortLlms).toContain("Canonical calculator for fork and rear-shock sag");
    expect(shortLlms).toContain("Canonical full-system how-to owner");
    expect(shortLlms).toContain("Fork-only owner");
    expect(fullLlms).toContain("no generic rear PSI, coil rate, riding-style multiplier or duplicate tyre calculator");
    expect(indexNow).toContain("`https://${HOST}/tools/shock-pressure`");
    expect(decision).toContain("5,179 | 150,287 | 3.4% | 6.2");
    expect(decision).toContain("24 November 2026");
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(expect.objectContaining({ id: 302, target_page: "/tools/shock-pressure" }));
    expect(prompts.prompts).toContainEqual(expect.objectContaining({ id: 303, target_page: "/tools/shock-pressure" }));
    expect(prompts.prompts).toContainEqual(expect.objectContaining({ id: 304, target_page: "/blog/mtb-suspension-setup-complete-guide" }));
    expect(prompts.prompts).toContainEqual(expect.objectContaining({ id: 305, target_page: "/blog/mtb-fork-setup-guide" }));
  });

  it("preserves distinct guides and consolidates the weak mixed duplicate", () => {
    const fullGuide = read("content/blog/mtb-suspension-setup-complete-guide.mdx");
    const forkGuide = read("content/blog/mtb-fork-setup-guide.mdx");
    const redirects = read("next.config.ts");
    const topics = read("src/lib/topics.ts");
    const pinned = read("src/lib/seo/llms-content.ts");

    expect(fullGuide).toContain('seoTitle: "MTB Suspension Setup Guide: Fork & Rear Shock (2026)"');
    expect(fullGuide).toContain('lastReviewed: "2026-08-26"');
    expect(fullGuide).toContain("There is no universal MTB fork or rear-shock PSI");
    expect(fullGuide).toContain("## Which Roadman page should you use?");
    expect(forkGuide).toContain('seoTitle: "MTB Fork Setup Guide: Pressure, Sag & Rebound (2026)"');
    expect(forkGuide).toContain('lastReviewed: "2026-08-26"');
    expect(forkGuide).toContain("### Worked example: 2026 FOX 38 FLOAT");
    for (const unsafe of [
      "Start PSI equal to your body weight in kilograms",
      "55-65% of your body weight",
      "RockShox forks self-equalise, Fox don't",
      "add 5-10 PSI above your target",
    ]) {
      expect(fullGuide).not.toContain(unsafe);
      expect(forkGuide).not.toContain(unsafe);
    }

    expect(existsSync(resolve(process.cwd(), "content/blog/suspension-pressure-setup-mtb-gravel-guide.mdx"))).toBe(false);
    expect(redirects).toContain('source: "/blog/suspension-pressure-setup-mtb-gravel-guide"');
    expect(redirects).toContain('destination: "/blog/mtb-suspension-setup-complete-guide"');
    expect(topics).not.toContain('"suspension-pressure-setup-mtb-gravel-guide"');
    expect(pinned).toContain('"mtb-suspension-setup-complete-guide"');
    expect(pinned).toContain('"mtb-fork-setup-guide"');
  });
});
