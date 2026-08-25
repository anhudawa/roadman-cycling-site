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

  it("allows render assets and the structured-image endpoint while blocking /api/", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    const rules = result.rules as Array<{ userAgent: string; allow: string[]; disallow: string[] }>;
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard?.allow).toContain("/");
    // /_next/static/ must be crawlable so Googlebot and AI crawlers can
    // fetch the JS/CSS bundles needed to render the page.
    expect(wildcard?.allow).toContain("/_next/static/");
    expect(wildcard?.allow).toContain("/api/og/blog-hero");
    expect(wildcard?.disallow).toContain("/api/");
    expect(wildcard?.disallow).toContain("/admin/");
    // The broader /_next/ tree stays blocked.
    expect(wildcard?.disallow).toContain("/_next/");
  });

  it("GPTBot and ClaudeBot are explicitly listed", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    const agents = (result.rules as Array<{ userAgent: string }>).map((r) => r.userAgent);
    expect(agents).toContain("GPTBot");
    expect(agents).toContain("ClaudeBot");
  });

  it("all rules keep the structured-image exception inside the /api/ block", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    for (const rule of result.rules as Array<{ allow: string[]; disallow: string[] }>) {
      expect(rule.disallow).toContain("/api/");
      expect(rule.allow).toContain("/api/og/blog-hero");
    }
  });

  it("advertises only the canonical sitemap index", async () => {
    const { default: robots } = await import("./robots");
    const result = robots();
    expect(result.sitemap).toBe("https://roadmancycling.com/sitemap-index.xml");
  });
});
