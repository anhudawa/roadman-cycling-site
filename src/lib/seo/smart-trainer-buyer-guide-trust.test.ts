import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { highVolumeQuery3Answers } from "@/lib/answers-data/high-volume-queries-3";

const GUIDE_PATH = "content/blog/best-indoor-smart-trainers-2026.mdx";

describe("smart-trainer buyer-guide trust", () => {
  const source = readFileSync(resolve(process.cwd(), GUIDE_PATH), "utf8");
  const { data, content } = matter(source);
  const shortAnswer = highVolumeQuery3Answers.find(
    (answer) => answer.slug === "best-indoor-smart-trainer",
  );

  it("publishes a current, reviewed 2026 model set", () => {
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Garmin, Wahoo, Elite, JetBlack");

    for (const model of [
      "Wahoo KICKR CORE 2",
      "Tacx NEO 3M",
      "Elite Justo 2",
      "Wahoo KICKR v6",
      "Elite Avanti",
      "JetBlack VICTORY",
    ]) {
      expect(source).toContain(model);
    }
  });

  it("removes obsolete products and unsupported experience claims", () => {
    for (const staleClaim of [
      "Saris H4",
      "Elite Suito-T",
      "JetBlack VOLT",
      "I've spent the winter testing seven trainers",
      "hundreds of hours of actual use",
      "5-15 dB quieter",
      "IndieVelo",
      "should last 5-8 years",
    ]) {
      expect(source).not.toContain(staleClaim);
    }

    expect(source).toContain(
      "not presented as independent laboratory test results",
    );
    expect(source).toContain(
      "does not publish an invented decibel ranking",
    );
  });

  it("links every specification family and app check to first-party documentation", () => {
    for (const domain of [
      "https://www.garmin.com/",
      "https://support.wahoofitness.com/",
      "https://www.elite-it.com/",
      "https://www.jetblackcycling.com/",
      "https://support.zwift.com/",
      "https://support.trainerroad.com/",
      "https://support.rouvy.com/",
    ]) {
      expect(source).toContain(domain);
    }

    expect(source).toContain("Manufacturer specifications are labelled");
    expect(source).toContain("temporary prices are excluded");
  });

  it("keeps the short answer aligned with the full buyer guide", () => {
    expect(shortAnswer).toBeDefined();
    expect(shortAnswer?.updatedDate).toBe("2026-08-25");
    expect(shortAnswer?.directAnswer).toContain("Wahoo KICKR CORE 2");
    expect(shortAnswer?.directAnswer).toContain("full current-model guide");

    const answerText = JSON.stringify(shortAnswer);
    for (const unsupportedClaim of [
      "$600-900",
      "50-70% less",
      "30-50% quieter",
      "5-10 years",
      "before every session",
      "every major training app",
    ]) {
      expect(answerText).not.toContain(unsupportedClaim);
    }
  });

  it("does not duplicate the page-template H1", () => {
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("adds the guide to the recurring IndexNow comparison set", () => {
    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNowSource).toContain('"best-indoor-smart-trainers-2026"');
  });
});
