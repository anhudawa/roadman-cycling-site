import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const guide = readFileSync(
  resolve(process.cwd(), "content/blog/best-cycling-podcasts-2026.mdx"),
  "utf8",
);

describe("best cycling podcasts guide freshness", () => {
  it("records the August 2026 review and discloses Roadman's conflict", () => {
    expect(guide).toContain("lastReviewed: '2026-08-25'");
    expect(guide).toContain("updatedDate: '2026-08-25'");
    expect(guide).toContain("**Editorial disclosure:**");
    expect(guide).toContain("Roadman Cycling publishes this guide");
  });

  it("does not rank the inactive Cycling News Podcast as a current show", () => {
    expect(guide).not.toContain("### 14. Cycling News Podcast");
    expect(guide).toContain("### 14. Off The Back — A Cycling Weekly Podcast");
    expect(guide).toContain("last published episode was in July 2021");
  });

  it("routes readers into Roadman's new video watch layer", () => {
    expect(guide).toContain("[watch full cycling podcast videos](/watch)");
    expect(guide).toContain("[Watch on Roadman](/watch)");
  });
});
