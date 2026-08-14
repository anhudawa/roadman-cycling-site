import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /feeds/research.json", () => {
  it("publishes the benchmark data with methodology and provenance", async () => {
    const response = GET();
    const body = await response.json();

    expect(body.canonicalPage).toBe("https://roadmancycling.com/benchmarks");
    expect(body.dataset.report.version).toBe("1.0");
    expect(body.dataset.methodology.sources.length).toBeGreaterThan(0);
    expect(body.dataset.ftpByAge.length).toBeGreaterThan(0);
  });
});
