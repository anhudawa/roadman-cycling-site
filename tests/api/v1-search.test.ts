import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/search/route";

function makeRequest(query: string): Request {
  return new Request(`https://roadmancycling.com/api/v1/search${query}`);
}

describe("GET /api/v1/search", () => {
  it("returns guest results when type=guest is requested", async () => {
    // 'pro' is a substring of 'pro-rider' (a guest tag) and most credentials,
    // so it reliably matches guests via keyword scoring.
    const res = GET(makeRequest("?q=pro&type=guest&limit=5"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    for (const r of body.results) {
      expect(r.type).toBe("guest");
      expect(r.url).toMatch(/\/guests\//);
    }
  });

  it("returns tool results when type=tool is requested", async () => {
    // Every tool entry mentions 'calculator' in its title or description.
    const res = GET(makeRequest("?q=calculator&type=tool"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    for (const r of body.results) {
      expect(r.type).toBe("tool");
      expect(r.url).toMatch(/\/tools\//);
    }
  });

  it("advertises all six indexed types in the response", async () => {
    const res = GET(makeRequest("?q=ftp"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.indexedTypes).toEqual(
      expect.arrayContaining(["article", "episode", "topic", "glossary", "guest", "tool"]),
    );
  });

  it("400s on missing query", async () => {
    const res = GET(makeRequest(""));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required query parameter/i);
  });

  it("respects comma-separated type filter for the new types", async () => {
    const res = GET(makeRequest("?q=zone&type=tool,glossary"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    for (const r of body.results) {
      expect(["tool", "glossary"]).toContain(r.type);
    }
  });
});
