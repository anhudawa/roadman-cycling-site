import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /search-ownership.json", () => {
  it("publishes the canonical owner for each priority query family", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(5);
    expect(body.owners).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ primaryQuery: "cycling podcast", url: "https://roadmancycling.com/podcast" }),
        expect.objectContaining({ primaryQuery: "cycling coaching", url: "https://roadmancycling.com/coaching" }),
        expect.objectContaining({ primaryQuery: "masters cycling", url: "https://roadmancycling.com/masters" }),
      ]),
    );
  });
});
