import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const GUIDE_PATH =
  "content/blog/cycling-power-meter-accuracy-troubleshooting-guide.mdx";

describe("power-meter troubleshooting trust", () => {
  const source = read(GUIDE_PATH);
  const { data, content } = matter(source);

  it("publishes a reviewed, model-specific diagnostic", () => {
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Favero, Garmin and SRAM/Quarq");
    expect(content.match(/^# /gm)).toBeNull();

    for (const behaviour of [
      "automatic calibration after a manual calibration on first or new installation",
      "Rally 110/210 calibrates automatically while idle",
      "Pedal IQ",
      "MagicZero",
      "DUB-PWR requires its documented manual procedure",
    ]) {
      expect(source).toContain(behaviour);
    }
  });

  it("links calibration and diagnostic claims to primary support", () => {
    for (const url of [
      "https://cycling.favero.com/faq/",
      "https://cycling.favero.com/blog/how-to-install-assioma-pro/",
      "https://support.garmin.com/en-PH/?faq=EBHEIxmxyS30KMSMcCwC46",
      "https://support.garmin.com/en-US/?faq=ph1MWBYk3V8gj8TSaoWiN7",
      "https://www.sram.com/en/quarq/campaigns/magiczero-auto-calibration",
      "https://www.sram.com/globalassets/document-hierarchy/user-manuals/quarq/power-meters/quarq-power-meter-user-manual.pdf",
    ]) {
      expect(source).toContain(url);
    }
  });

  it("removes universal offsets, battery rules and hardware diagnoses", () => {
    for (const staleClaim of [
      "5-15 watts of systematic drift",
      "3-10 per cent",
      "3-8 per cent",
      "almost always read higher",
      "Every 150-200 hours",
      "every 3-4 months",
      "charge before every ride",
      "single biggest accuracy issue",
      "expensive random number generator",
      "strain gauge may be failing",
      "more than 50 counts",
      "within 20-30 counts",
      "jumping around by 100+ counts",
      "Most power problems are fixable in five minutes",
    ]) {
      expect(source).not.toContain(staleClaim);
    }

    expect(source).toContain(
      "A watt number is evidence, not a verdict",
    );
    expect(source).toContain(
      "Do not diagnose strain-gauge failure from a ride file",
    );
  });

  it("routes the inconsistency prompt and IndexNow update to this page", () => {
    const prompts = read("scripts/ai-benchmark-prompts.json");
    expect(prompts).toContain(
      '"target_page": "/blog/cycling-power-meter-accuracy-troubleshooting-guide"',
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"cycling-power-meter-accuracy-troubleshooting-guide"',
    );
  });
});
