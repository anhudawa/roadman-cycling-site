import { describe, expect, it } from "vitest";

function makeRequest(body: string, contentType = "application/gpx+xml") {
  return new Request("https://roadmancycling.com/api/predict/parse-gpx", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

function makeGpx(points: number, options?: { missingElevationEvery?: number; spike?: boolean }) {
  const trkpts: string[] = [];
  for (let i = 0; i < points; i++) {
    const lat = (51 + i * 0.0005).toFixed(6);
    const lon = "-0.100000";
    const elevation =
      options?.spike && i === 25
        ? 500
        : 100 + i * 0.6;
    const hasElevation =
      !options?.missingElevationEvery || i % options.missingElevationEvery !== 0;
    trkpts.push(
      `<trkpt lat="${lat}" lon="${lon}">${hasElevation ? `<ele>${elevation.toFixed(1)}</ele>` : ""}</trkpt>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>API Test GPX</name>
    <trkseg>${trkpts.join("")}</trkseg>
  </trk>
</gpx>`;
}

async function post(body: string, contentType?: string) {
  const { POST } = await import("@/app/api/predict/parse-gpx/route");
  return POST(makeRequest(body, contentType));
}

describe("POST /api/predict/parse-gpx", () => {
  it("rejects unsupported content types before parsing", async () => {
    const res = await post(makeGpx(60), "text/plain");
    const body = await res.json();

    expect(res.status).toBe(415);
    expect(body.error).toMatch(/unsupported file type/i);
  });

  it("rejects an empty GPX body", async () => {
    const res = await post("   ");
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/empty gpx/i);
  });

  it("rejects a huge GPX body", async () => {
    const res = await post(`<gpx>${" ".repeat(8_000_001)}</gpx>`);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toMatch(/too large/i);
  });

  it("returns a useful parse error for malformed GPX content", async () => {
    const res = await post("<not-gpx></not-gpx>");
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalid gpx/i);
  });

  it("rejects sparse tracks that are too short for prediction", async () => {
    const res = await post(makeGpx(12));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/fewer than 50 points/i);
  });

  it("parses a valid GPX and returns profile, points, course stats, and quality", async () => {
    const res = await post(makeGpx(80, { missingElevationEvery: 20, spike: true }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe("API Test GPX");
    expect(body.points.length).toBeGreaterThanOrEqual(50);
    expect(body.profile).toHaveLength(121);
    expect(body.distanceM).toBeGreaterThan(3000);
    expect(body.elevationGainM).toBeGreaterThanOrEqual(0);
    expect(body.quality.rawPointCount).toBe(80);
    expect(body.quality.missingElevationCount).toBe(4);
    expect(body.warnings).toContain(
      "4 points are missing elevation, so the climbing estimate is less certain.",
    );
  });
});
