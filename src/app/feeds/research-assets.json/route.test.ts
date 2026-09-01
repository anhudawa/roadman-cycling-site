import { describe, expect, it } from "vitest";
import { RESEARCH_ASSET_KINDS } from "@/data/research-assets";
import { GET } from "./route";

describe("GET /feeds/research-assets.json", () => {
  it("publishes one typed, attributable catalogue of Roadman research assets", async () => {
    const response = GET();
    const body = await response.json();

    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalPage).toBe("https://roadmancycling.com/research");
    expect(body.assets).toHaveLength(4);
    expect(new Set(body.assets.map((asset: { id: string }) => asset.id)).size).toBe(4);
    expect(
      new Set(body.assets.map((asset: { canonicalUrl: string }) => asset.canonicalUrl)).size,
    ).toBe(4);

    for (const asset of body.assets) {
      expect(RESEARCH_ASSET_KINDS).toContain(asset.kind);
      expect(asset.canonicalUrl).toMatch(/^https:\/\/roadmancycling\.com\//);
      expect(asset.dataUrl).toMatch(/^https:\/\/roadmancycling\.com\//);
      expect(asset.methodology.length).toBeGreaterThan(80);
      expect(asset.limitations.length).toBeGreaterThanOrEqual(3);
      expect(asset.reuse.attribution).toContain("roadmancycling.com/");
    }
  });

  it("does not misrepresent frameworks or evidence benchmarks as datasets", async () => {
    const body = await GET().json();
    const byId = Object.fromEntries(
      body.assets.map((asset: { id: string }) => [asset.id, asset]),
    );

    expect(byId["amateur-cycling-performance-report-2026"].kind).toBe("dataset");
    expect(byId["sportive-readiness-index-2026"].kind).toBe("coaching-framework");
    expect(byId["amateur-cyclist-fuelling-benchmarks-2026"].kind).toBe(
      "evidence-benchmark",
    );
  });
});
