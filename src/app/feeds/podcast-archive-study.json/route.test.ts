import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /feeds/podcast-archive-study.json", () => {
  it("publishes the frozen archive dataset with method, limits and license", async () => {
    const response = GET();
    const body = await response.json();

    expect(body.report.episodeCount).toBe(818);
    expect(body.report.version).toBe("2026-08-31");
    expect(
      body.pillars.reduce(
        (sum: number, row: { episodes: number }) => sum + row.episodes,
        0,
      ),
    ).toBe(818);
    expect(
      body.formats.reduce(
        (sum: number, row: { episodes: number }) => sum + row.episodes,
        0,
      ),
    ).toBe(818);
    expect(body.byYear).toHaveLength(10);
    expect(body.methodology.limitations).toHaveLength(4);
    expect(body.licenseUrl).toBe(
      "https://creativecommons.org/licenses/by/4.0/",
    );
  });
});
