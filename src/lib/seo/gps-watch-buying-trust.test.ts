import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const article = readFileSync(
  resolve(process.cwd(), "content/blog/gps-watches-cycling-running-guide.mdx"),
  "utf8",
);

describe("GPS watch buying-guide trust", () => {
  it("publishes a current review trail and primary product sources", () => {
    expect(article).toContain("updatedDate: '2026-08-31'");
    expect(article).toContain("lastReviewed: '2026-08-31'");
    expect(article).toContain("https://www8.garmin.com/manuals/");
    expect(article).toContain("https://www.coros.com/apex4");
    expect(article).toContain("https://www.apple.com/apple-watch-ultra-3/specs/");
    expect(article).toContain("https://help.trainingpeaks.com/");
  });

  it("answers ecosystem and battery intent without comparing unlike claims as one test", () => {
    expect(article).toContain(
      "These are manufacturer claims under different test modes, not a like-for-like battery test.",
    );
    expect(article).toContain("Wahoo has no matching watch");
    expect(article).toContain("COROS APEX 4 — the natural DURA pairing");
    expect(article).not.toContain("roughly half the price");
  });

  it("does not manufacture hands-on testing or a universal cadence target", () => {
    expect(article).toContain("There is no universal cadence target");
    expect(article).toContain(
      "evidence for injury and performance outcomes was insufficient",
    );
    expect(article).not.toContain("months of actual use");
    expect(article).not.toContain("170-180");
  });
});
