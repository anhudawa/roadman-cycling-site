import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/brand-facts", () => ({
  SITE_ORIGIN: "https://roadmancycling.com",
  BRAND_STATS: {},
  FOUNDER: {},
}));

describe("robots()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 14 rules (wildcard + 13 named crawlers)", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    expect((result.rules as unknown[]).length).toBe(14);
  });

  it("wildcard rule allows / and disallows /api/", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    const rules = result.rules as Array<{ userAgent: string; allow: string; disallow: string[] }>;
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toContain("/api/");
    expect(wildcard?.disallow).toContain("/admin/");
  });

  it("GPTBot and ClaudeBot are explicitly listed", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    const agents = (result.rules as Array<{ userAgent: string }>).map((r) => r.userAgent);
    expect(agents).toContain("GPTBot");
    expect(agents).toContain("ClaudeBot");
  });

  it("all rules disallow /api/", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    for (const rule of result.rules as Array<{ disallow: string[] }>) {
      expect(rule.disallow).toContain("/api/");
    }
  });

  it("sitemap array contains sitemap-index.xml", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    const sitemaps = result.sitemap as string[];
    expect(sitemaps.some((s) => s.includes("sitemap-index.xml"))).toBe(true);
  });
});
