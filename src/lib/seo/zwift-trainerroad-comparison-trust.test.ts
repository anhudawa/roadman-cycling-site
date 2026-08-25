import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const GUIDE_PATH = "content/blog/zwift-vs-trainerroad.mdx";

describe("Zwift versus TrainerRoad comparison trust", () => {
  const source = readFileSync(resolve(process.cwd(), GUIDE_PATH), "utf8");
  const { data, content } = matter(source);

  it("publishes the current direct integration and review date", () => {
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("TrainerRoad and Zwift");
    expect(source).toContain("direct TrainerRoad and Zwift integration");
    expect(source).toContain("updates Progression Levels");
    expect(source).toContain("Both active subscriptions are required");
  });

  it("uses current first-party product, integration, price, and device sources", () => {
    expect(source).toContain(
      "https://support.trainerroad.com/hc/en-us/articles/33845424766235-Training-in-Zwift-with-TrainerRoad-FAQ",
    );
    expect(source).toContain("https://www.trainerroad.com/pricing");
    expect(source).toContain(
      "https://support.trainerroad.com/hc/en-us/articles/201682804-Compatible-Devices-and-Sensors",
    );
    expect(source).toContain("https://support.zwift.com/en_us/categories/faqs-HyGeSnuRQ");
  });

  it("removes unsupported comparative performance and scale claims", () => {
    for (const staleClaim of [
      "TrainerRoad tends to produce larger FTP gains",
      "Zwift has around 1.2 million subscribers",
      "thousands of races per week",
      "Drafting saves roughly 25-33%",
      "Any ANT+ or Bluetooth smart trainer works",
      "documented FTP gains of 15-30 watts",
      "two riders on the same plan diverge by week four",
    ]) {
      expect(source).not.toContain(staleClaim);
    }
  });

  it("states current time-bound prices and combined cost", () => {
    expect(source).toContain("25 August 2026");
    expect(source).toContain("Zwift | $19.99 | $199.99");
    expect(source).toContain("TrainerRoad | $21.99 | $209.99");
    expect(source).toContain("Both at monthly list price | $41.98");
    expect(source).toContain("Applicable taxes, app-store billing");
  });

  it("does not duplicate the page-template H1 and remains in IndexNow", () => {
    expect(content.match(/^# /gm)).toBeNull();

    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNowSource).toContain('"zwift-vs-trainerroad"');
  });
});
