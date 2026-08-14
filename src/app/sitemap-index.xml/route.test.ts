import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/brand-facts", () => ({
  SITE_ORIGIN: "https://roadmancycling.com",
}));

describe("sitemap index", () => {
  it("lists every generated sitemap partition, including recommends", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const xml = await response.text();

    for (let id = 0; id <= 7; id += 1) {
      expect(xml).toContain(
        `<loc>https://roadmancycling.com/sitemap/${id}.xml</loc>`,
      );
    }

    expect(xml.match(/<sitemap>/g)).toHaveLength(8);
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
