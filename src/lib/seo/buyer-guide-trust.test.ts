import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const GUIDE_PATH = "content/blog/best-cycling-computers-2026.mdx";

describe("cycling computer buyer-guide trust", () => {
  const source = readFileSync(resolve(process.cwd(), GUIDE_PATH), "utf8");
  const { data, content } = matter(source);

  it("publishes a current, reviewed 2026 model set", () => {
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Garmin, Wahoo and Hammerhead");

    for (const model of [
      "Garmin Edge 1050",
      "Garmin Edge 850",
      "Garmin Edge 550",
      "Wahoo ELEMNT ROAM 3",
      "Wahoo ELEMNT BOLT 3",
      "Hammerhead Karoo",
    ]) {
      expect(source).toContain(model);
    }

    expect(data.keywords).not.toContain("wahoo elemnt roam v2");
    expect(data.keywords).not.toContain("hammerhead karoo 3");
  });

  it("removes the false Edge 1050 solar and obsolete-spec claims", () => {
    expect(source).toContain("the Edge 1050 does not have solar charging");
    expect(source).not.toContain("solar charging extending battery life to 30+ hours");
    expect(source).not.toContain("3.2-inch, 400x240");
    expect(source).not.toContain("The Karoo 3 manages roughly 10 to 12 hours");
    expect(source).not.toContain("Battery life sits at 15 to 17 hours");
  });

  it("links every specification family to first-party documentation", () => {
    expect(source).toContain("https://www.garmin.com/");
    expect(source).toContain("https://support.wahoofitness.com/");
    expect(source).toContain("https://support.hammerhead.io/");
    expect(source).toContain("manufacturer maximum");
    expect(source).toContain("Manufacturer claims are labelled as such");
  });

  it("does not duplicate the page-template H1", () => {
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("stays in the recurring IndexNow comparison set", () => {
    const indexNowSource = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );
    expect(indexNowSource).toContain('"best-cycling-computers-2026"');
  });
});
