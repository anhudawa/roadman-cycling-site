import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const GUIDE_PATH = "content/blog/rouvy-vs-zwift.mdx";

describe("ROUVY versus Zwift comparison trust", () => {
  const source = readFileSync(resolve(process.cwd(), GUIDE_PATH), "utf8");
  const { data, content } = matter(source);

  it("publishes the material 2026 ownership change", () => {
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("ROUVY and Zwift");
    expect(source).toContain("Zwift acquired ROUVY in April 2026");
    expect(source).toContain("separate roadmaps and membership platforms");
    expect(source).toContain("there is no combined membership");
  });

  it("uses current first-party acquisition, price, and compatibility sources", () => {
    expect(source).toContain(
      "https://support.zwift.com/en_us/zwift-and-rouvy-faq-ByG7Av0be",
    );
    expect(source).toContain(
      "https://support.rouvy.com/hc/en-us/articles/46200881577489-ROUVY-has-been-acquired-by-Zwift",
    );
    expect(source).toContain("https://rouvy.com/en/pricing");
    expect(source).toContain(
      "https://support.rouvy.com/hc/en-us/articles/14059132272529-Supported-Trainers",
    );
    expect(source).toContain("Prices below were checked");
  });

  it("removes stale and unsupported comparison claims", () => {
    for (const staleClaim of [
      "Rouvy's 2024 price adjustment",
      "over one million active subscribers",
      "thousands of races per week",
      "Any ANT+ or Bluetooth smart trainer works on both platforms",
      "Setting trainer difficulty to 50% is standard practice",
      "trivial against the cost of a bike",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
  });

  it("states time-bound US prices without presenting them as permanent", () => {
    expect(source).toContain("26 August 2026");
    expect(source).toContain("ROUVY Single | $19.99 | $179.99");
    expect(source).toContain("Zwift | $19.99 | $199.99");
    expect(source).toContain("taxes, app-store billing, trials and regional pricing vary");
  });

  it("does not duplicate the page-template H1 and remains in IndexNow", () => {
    expect(content.match(/^# /gm)).toBeNull();

    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNowSource).toContain('"rouvy-vs-zwift"');
  });
});
