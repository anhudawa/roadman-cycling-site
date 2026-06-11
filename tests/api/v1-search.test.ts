import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/search/route";

// The search handler eagerly loads every content source (posts, episodes,
// topics, glossary, guests, tools) on first call. Under full-suite parallel
// transform that cold read can take ~40s, so this file relies on the generous
// global testTimeout in vitest.config.mts rather than a per-file override
// (the old 30s cap was both redundant and, on a loaded machine, too tight).

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
    // `indexedTypes` is a static capabilities list the route always returns,
    // independent of the query or type filter. Scope to `type=tool` so the
    // handler only loads the tools source — an unfiltered query would cold-read
    // the entire content corpus (hundreds of MDX files) purely as a side effect,
    // which is wasted work for a static-array assertion.
    const res = GET(makeRequest("?q=ftp&type=tool"));
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
