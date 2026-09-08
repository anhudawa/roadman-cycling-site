import { describe, expect, it } from "vitest";
import { safeApplicationNextUrl } from "./application-next-url";

const token = "a".repeat(64);

describe("safeApplicationNextUrl", () => {
  it("accepts a personal link from the current preview deployment", () => {
    const origin = "https://roadman-preview.example.vercel.app";
    expect(safeApplicationNextUrl(`${origin}/apply/next#join/${token}`, origin)).toBe(
      `${origin}/apply/next#join/${token}`,
    );
  });

  it("accepts the production questions link", () => {
    expect(safeApplicationNextUrl(`https://www.roadmancycling.com/apply/next#questions/${token}`, "https://roadmancycling.com")).toBe(
      `https://www.roadmancycling.com/apply/next#questions/${token}`,
    );
  });

  it.each([
    `https://attacker.example/apply/next#join/${token}`,
    `https://www.roadmancycling.com/other#join/${token}`,
    `https://www.roadmancycling.com/apply/next?token=${token}#join/${token}`,
    "not a URL",
  ])("rejects an unsafe next-step URL: %s", (value) => {
    expect(safeApplicationNextUrl(value, "https://roadman-preview.example.vercel.app")).toBeNull();
  });
});
