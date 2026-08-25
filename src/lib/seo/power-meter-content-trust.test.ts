import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { highVolumeQuery2Answers } from "@/lib/answers-data/high-volume-queries-2";
import { highVolumeQuery4Answers } from "@/lib/answers-data/high-volume-queries-4";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const BUYER_PATH = "content/blog/power-meter-buying-guide-cyclists.mdx";
const COMPARISON_PATH = "content/blog/power-meter-vs-smart-trainer.mdx";

describe("power-meter knowledge-layer trust", () => {
  it("publishes one current, reviewed buyer guide", () => {
    const source = read(BUYER_PATH);
    const { data, content } = matter(source);

    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Favero, Garmin, 4iiii, SRAM/Quarq and Shimano");
    expect(content.match(/^# /gm)).toBeNull();

    for (const currentModel of [
      "Assioma PRO RS",
      "Assioma PRO RL",
      "Assioma PRO MX",
      "Rally 110 and 210",
      "PRECISION 3+ PRO",
      "AXS Power Meter Spider",
      "Quarq DZero DUB",
      "FC-R9200-P",
      "FC-R8100-P",
    ]) {
      expect(source).toContain(currentModel);
    }
  });

  it("uses primary product documentation and labels the editorial limits", () => {
    const source = read(BUYER_PATH);

    for (const domain of [
      "https://cycling.favero.com/",
      "https://www.garmin.com/",
      "https://4iiii.com/",
      "https://www.sram.com/",
      "https://bike.shimano.com/",
    ]) {
      expect(source).toContain(domain);
    }

    expect(source).toContain("not claims that Roadman independently laboratory-tested every meter");
    expect(source).toContain("Manufacturer specifications are labelled and linked");
    expect(source).toContain("temporary retail prices are deliberately excluded");
  });

  it("removes unsafe legacy product and experience claims", () => {
    const source = read(BUYER_PATH);

    for (const staleClaim of [
      "Stages Gen 3",
      "Assioma Duo-Shi at $569",
      "Rally RS200",
      "Rally XC200",
      "PRECISION 3+ (dual-sided)",
      "spindle failures",
      "warranty claims per unit",
      "strain gauge bonds degrade",
      "I've tested most of the power meters",
      "identical training outcomes",
      "failure rate, based on community data",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
  });

  it("keeps the trainer comparison distinct and evidence-honest", () => {
    const source = read(COMPARISON_PATH);
    const { data, content } = matter(source);

    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(content.match(/^# /gm)).toBeNull();
    expect(source).toContain("There is no evidence-backed rule");
    expect(source).toContain("KICKR CORE 2 is direct drive");
    expect(source).toContain("https://support.zwift.com/");
    expect(source).toContain("https://support.trainerroad.com/");
    expect(source).toContain("https://support.rouvy.com/");

    for (const staleClaim of [
      "15–25% of their prescribed load",
      "15-25% of their prescribed load",
      "outdoor power typically reads 5-15W lower",
      "Around 70%",
      "within two years",
      "move between bikes in 90 seconds",
      "Running costs:",
      "Wahoo Kickr Core (direct drive, no cassette included)",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
  });

  it("consolidates duplicate URLs and AI demand into the owner", () => {
    for (const duplicate of [
      "content/blog/cycling-power-meter-guide.mdx",
      "content/blog/cycling-power-meter-buying-guide.mdx",
    ]) {
      expect(existsSync(resolve(root, duplicate))).toBe(false);
    }

    const redirects = read("next.config.ts");
    for (const source of [
      "/blog/cycling-power-meter-guide",
      "/blog/cycling-power-meter-buying-guide",
      "/best/best-power-meters-amateur-cyclists",
    ]) {
      const sourceIndex = redirects.indexOf(`source: "${source}"`);
      expect(sourceIndex).toBeGreaterThan(-1);
      expect(redirects.slice(sourceIndex, sourceIndex + 300)).toContain(
        'destination: "/blog/power-meter-buying-guide-cyclists"',
      );
      expect(redirects.slice(sourceIndex, sourceIndex + 300)).toContain(
        "permanent: true",
      );
    }

    const prompts = read("scripts/ai-benchmark-prompts.json");
    expect(prompts).not.toContain(
      '"target_page": "/blog/cycling-power-meter-buying-guide"',
    );
    expect(prompts).toContain(
      '"target_page": "/blog/power-meter-buying-guide-cyclists"',
    );

    expect(read("src/lib/best-for.ts")).not.toContain(
      'slug: "best-power-meters-amateur-cyclists"',
    );
  });

  it("routes the hub, featured content and IndexNow set to the owner", () => {
    expect(read("content/topics/power-meter-training.mdx")).toContain(
      "](/blog/power-meter-buying-guide-cyclists)",
    );
    expect(read("src/lib/topics.ts")).not.toContain(
      '"cycling-power-meter-guide"',
    );
    expect(read("src/lib/topics.ts")).not.toContain(
      '"cycling-power-meter-buying-guide"',
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(
      '"power-meter-buying-guide-cyclists"',
    );
  });

  it("keeps direct AI answers aligned with model-specific guidance", () => {
    const needMeter = highVolumeQuery2Answers.find(
      (answer) => answer.slug === "do-i-need-a-power-meter",
    );
    const pairing = highVolumeQuery4Answers.find(
      (answer) => answer.slug === "how-to-pair-a-power-meter",
    );

    expect(needMeter?.updatedDate).toBe("2026-08-25");
    expect(needMeter?.directAnswer).toContain("You do not need a power meter to improve");
    expect(JSON.stringify(needMeter)).not.toContain("20-50+ watts");
    expect(JSON.stringify(needMeter)).not.toContain("becomes essential");

    expect(pairing?.updatedDate).toBe("2026-08-25");
    expect(pairing?.directAnswer).toContain("Do not assume every meter requires a manual zero");
    expect(JSON.stringify(pairing)).not.toContain("Calibrate (zero offset) before every ride");
    expect(JSON.stringify(pairing)).not.toContain("reads 2-5% higher");
  });
});
