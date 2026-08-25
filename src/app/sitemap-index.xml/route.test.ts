import { describe, expect, it, vi } from "vitest";
import { SITEMAP_IDS, VIDEO_SITEMAP_URL } from "@/lib/seo/sitemaps";

vi.mock("@/lib/brand-facts", () => ({
  SITE_ORIGIN: "https://roadmancycling.com",
}));

describe("sitemap index", () => {
  it("lists every generated sitemap partition, including recommends", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const xml = await response.text();

    for (const id of SITEMAP_IDS) {
      expect(xml).toContain(
        `<loc>https://roadmancycling.com/sitemap/${id}.xml</loc>`,
      );
    }

    expect(xml).toContain(`<loc>${VIDEO_SITEMAP_URL}</loc>`);
    expect(xml.match(/<sitemap>/g)).toHaveLength(SITEMAP_IDS.length + 1);
  });

  it("does not claim that every child sitemap changed at request time", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain("<lastmod>");
    expect(response.headers.get("content-type")).toBe(
      "application/xml; charset=utf-8",
    );
  });
});
