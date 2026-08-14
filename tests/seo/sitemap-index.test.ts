import { describe, expect, it } from "vitest";

describe("GET /sitemap-index.xml", () => {
  it("returns valid XML sitemap-index pointing at all 8 split sitemaps", async () => {
    const { GET } = await import("@/app/sitemap-index.xml/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/xml/);
    expect(res.headers.get("cache-control")).toMatch(/public/);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml /);
    expect(body).toContain("<sitemapindex");
    expect(body).toContain("</sitemapindex>");
    for (let i = 0; i <= 7; i++) {
      expect(body).toContain(`https://roadmancycling.com/sitemap/${i}.xml`);
    }
    // IDs 0..7, including expert × topic pages and Roadman Recommends.
    const childCount = (body.match(/<sitemap>/g) ?? []).length;
    expect(childCount).toBe(8);
    // The index has no trustworthy per-partition change timestamp, so it
    // must not pretend every child changed at request time.
    expect(body).not.toContain("<lastmod>");
  });
});
