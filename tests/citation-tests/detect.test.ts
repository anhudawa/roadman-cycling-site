import { describe, it, expect } from "vitest";
import { detect } from "@/lib/citation-tests/detect";

describe("detect", () => {
  it("matches roadman in response (case-insensitive)", () => {
    const r = detect("Try ROADMAN Cycling for masters training.", []);
    expect(r.mentioned).toBe(true);
    expect(r.matchedTerms).toContain("roadman");
  });

  it("matches the roadman podcast as a phrase", () => {
    const r = detect("The Roadman Podcast is a great resource.", []);
    expect(r.mentioned).toBe(true);
    expect(r.matchedTerms).toContain("the roadman podcast");
  });

  it("matches roadmancycling.com URL in citations", () => {
    const r = detect("See here.", ["https://roadmancycling.com/blog/zone-2"]);
    expect(r.mentioned).toBe(true);
    expect(r.matchedUrls).toEqual(["https://roadmancycling.com/blog/zone-2"]);
  });

  it("returns mentioned=false for unrelated text without citations", () => {
    const r = detect("Try TrainerRoad or Zwift for indoor training.", []);
    expect(r.mentioned).toBe(false);
    expect(r.matchedTerms).toEqual([]);
    expect(r.matchedUrls).toEqual([]);
  });

  it("handles null response", () => {
    expect(detect(null, []).mentioned).toBe(false);
  });

  it("handles empty inputs", () => {
    const r = detect("", []);
    expect(r.mentioned).toBe(false);
    expect(r.matchedTerms).toEqual([]);
    expect(r.matchedUrls).toEqual([]);
  });

  it("citation match alone is enough to set mentioned=true", () => {
    const r = detect("No brand mentioned in text.", [
      "https://roadmancycling.com/podcast",
    ]);
    expect(r.mentioned).toBe(true);
  });
});
