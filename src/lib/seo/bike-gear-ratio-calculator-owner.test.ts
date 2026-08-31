import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getToolLanding } from "@/lib/tools/landing-content";

const ROOT = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("bike gear ratio calculator search owner", () => {
  it("owns calculator intent with an exact canonical and qualified snippet", () => {
    const layout = read("src/app/(content)/tools/gear-ratio/layout.tsx");

    expect(layout).toContain(
      "Bike Gear Ratio Calculator — Speed, Gear Inches & Development",
    );
    expect(layout).toContain('alternates: { canonical: "/tools/gear-ratio" }');
    expect(layout).toContain("Free bike gear ratio calculator");
  });

  it("uses corrected nominal rollouts and supports a measured circumference", () => {
    const page = read("src/app/(content)/tools/gear-ratio/page.tsx");

    expect(page).toContain('{ label: "700x32c", rolloutMm: 2155 }');
    expect(page).toContain('{ label: "700x35c", rolloutMm: 2168 }');
    expect(page).toContain('id="custom-rollout"');
    expect(page).toContain("loaded rollout measurement");
    expect(page).toContain("Last reviewed: 31 August 2026");
    expect(page).not.toContain('{ label: "700x32c", rolloutMm: 2168 }');
    expect(page).not.toContain('650b x 47mm (gravel)", rolloutMm: 2070');
    expect(page).not.toContain("A 2-3% difference is typical");
  });

  it("keeps manufacturer-labelled cassette presets on their published tooth sequences", () => {
    const page = read("src/app/(content)/tools/gear-ratio/page.tsx");

    expect(page).toContain(
      '{ label: "11-28 (Shimano 11-speed)", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28] }',
    );
    expect(page).toContain(
      '{ label: "11-34 (Shimano 12-speed)", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34] }',
    );
    expect(page).toContain(
      '{ label: "10-36 (SRAM 12-speed)", cogs: [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36] }',
    );
    expect(page).toContain(
      '{ label: "10-44 (SRAM XPLR 12-speed)", cogs: [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44] }',
    );
  });

  it("renders a dated, source-backed trust and schema layer", () => {
    const landing = getToolLanding("gear-ratio");

    expect(landing).toBeDefined();
    expect(landing?.dateModified).toBe("2026-08-31");
    expect(landing?.reviewedBy).toBe("Anthony Walsh");
    expect(landing?.faqs.length).toBeGreaterThanOrEqual(5);
    expect(landing?.evidenceSources?.length).toBeGreaterThanOrEqual(8);
    expect(landing?.limitations).toContain("does not prove a cassette will work");
    expect(landing?.related).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: "/blog/gear-ratio-cycling-complete-guide" }),
        expect.objectContaining({ href: "/answers/what-gear-ratio-for-climbing" }),
        expect.objectContaining({ href: "/tools/cadence" }),
      ]),
    );
  });

  it("keeps both the calculator and explanatory guide in priority recrawl", () => {
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(indexNow).toContain("`https://${HOST}/tools/gear-ratio`");
    expect(indexNow).toContain(
      "`https://${HOST}/blog/gear-ratio-cycling-complete-guide`",
    );
  });
});
