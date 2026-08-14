import { describe, expect, it } from "vitest";
import {
  encodeVerifiedRouteSource,
  routeProvenanceFromSource,
} from "./route-provenance";

describe("route provenance", () => {
  it("round-trips verified route source metadata", () => {
    const encoded = encodeVerifiedRouteSource(
      "abc123",
      "https://example.com/routes/race.gpx",
    );
    expect(routeProvenanceFromSource(encoded)).toMatchObject({
      quality: "verified_gpx",
      sourceHash: "abc123",
      sourceUrl: "https://example.com/routes/race.gpx",
    });
  });

  it("distinguishes provisional, uploaded, and event-profile routes", () => {
    expect(routeProvenanceFromSource("the_traka_2026_rwgps_public_embed").quality).toBe(
      "public_provisional",
    );
    expect(routeProvenanceFromSource("user_upload").quality).toBe("user_upload");
    expect(routeProvenanceFromSource("mallorca_312").quality).toBe(
      "event_profile",
    );
  });
});
