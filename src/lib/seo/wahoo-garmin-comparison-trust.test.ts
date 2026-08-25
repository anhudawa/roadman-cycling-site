import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const GUIDE_PATH = "content/blog/wahoo-vs-garmin-cycling-computers.mdx";

describe("Wahoo versus Garmin comparison trust", () => {
  const source = readFileSync(resolve(process.cwd(), GUIDE_PATH), "utf8");
  const { data, content } = matter(source);

  it("publishes a current and reviewed 2026 comparison", () => {
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Garmin and Wahoo");

    for (const model of [
      "Garmin Edge 1050",
      "Garmin Edge 850",
      "Garmin Edge 550",
      "Wahoo ELEMNT ACE",
      "Wahoo ELEMNT ROAM 3",
      "Wahoo ELEMNT BOLT 3",
    ]) {
      expect(source).toContain(model);
    }
  });

  it("labels official battery claims without inventing test results", () => {
    expect(source).toContain("manufacturer claims");
    expect(source).toContain("not directly comparable test results");
    expect(source).not.toContain("Multi-band GPS cuts 20 to 30 percent");
    expect(source).not.toContain("Real-world battery life");
    expect(source).not.toContain("15–20 hours");
    expect(source).not.toContain("17–22 hours");
  });

  it("uses current first-party documentation for the decision", () => {
    expect(source).toContain("https://www.garmin.com/en-US/compare/");
    expect(source).toContain(
      "https://support.wahoofitness.com/hc/en-us/articles/22709312101650-ELEMNT-ACE-2024-Product-Information",
    );
    expect(source).toContain(
      "https://support.wahoofitness.com/hc/en-us/articles/24548064278674-Use-ANT-Radar-sensors-with-ELEMNT-ACE-ROAM-3-and-BOLT-3",
    );
    expect(source).toContain("Corrections can be submitted");
  });

  it("removes temporary pricing and stale product positioning", () => {
    expect(source).not.toMatch(/\$\d/);
    expect(source).not.toContain("Edge 540, 840, and the flagship Edge 1050");
    expect(source).not.toContain("Wahoo Elemnt Bolt: 15–20 hours");
    expect(source).not.toContain("athletes execute intervals more accurately");
  });

  it("does not duplicate the page-template H1 and remains in IndexNow", () => {
    expect(content.match(/^# /gm)).toBeNull();

    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNowSource).toContain('"wahoo-vs-garmin-cycling-computers"');
  });
});
