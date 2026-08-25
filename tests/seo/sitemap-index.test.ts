import { describe, expect, it } from "vitest";
import {
  SITEMAP_IDS,
  VIDEO_SITEMAP_URL,
  getChildSitemapUrl,
} from "@/lib/seo/sitemaps";

describe("GET /sitemap-index.xml", () => {
  it("returns valid XML pointing at every declared child and video sitemap", async () => {
    const { GET } = await import("@/app/sitemap-index.xml/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/xml/);
    expect(res.headers.get("cache-control")).toMatch(/public/);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml /);
    expect(body).toContain("<sitemapindex");
    expect(body).toContain("</sitemapindex>");
    for (const id of SITEMAP_IDS) {
      expect(body).toContain(`<loc>${getChildSitemapUrl(id)}</loc>`);
    }
    expect(body).toContain(`<loc>${VIDEO_SITEMAP_URL}</loc>`);
    // Eight metadata partitions plus the dedicated Google video sitemap.
    const childCount = (body.match(/<sitemap>/g) ?? []).length;
    expect(childCount).toBe(SITEMAP_IDS.length + 1);
    // The index has no trustworthy per-partition change timestamp, so it
    // must not pretend every child changed at request time.
    expect(body).not.toContain("<lastmod>");
  });
});
