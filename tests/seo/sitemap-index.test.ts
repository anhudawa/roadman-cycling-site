import { describe, expect, it } from "vitest";

describe("GET /sitemap-index.xml", () => {
  it("returns valid XML sitemap-index pointing at all 6 split sitemaps", async () => {
    const { GET } = await import("@/app/sitemap-index.xml/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/xml/);
    expect(res.headers.get("cache-control")).toMatch(/public/);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml /);
    expect(body).toContain("<sitemapindex");
    expect(body).toContain("</sitemapindex>");
    for (let i = 0; i <= 5; i++) {
      expect(body).toContain(`https://roadmancycling.com/sitemap/${i}.xml`);
    }
    // 6 <sitemap> child elements
    const childCount = (body.match(/<sitemap>/g) ?? []).length;
    expect(childCount).toBe(6);
    // Every sitemap entry has a lastmod ISO date
    expect(body).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T/);
  });
});
