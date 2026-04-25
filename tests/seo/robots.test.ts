import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { SITE_ORIGIN } from "@/lib/brand-facts";

describe("/robots.ts", () => {
  const result = robots();

  it("includes the canonical sitemap-index.xml", () => {
    expect(result.sitemap).toContain(`${SITE_ORIGIN}/sitemap-index.xml`);
  });

  it("references all 6 split sitemaps (0..5)", () => {
    for (let i = 0; i <= 5; i++) {
      expect(result.sitemap).toContain(`${SITE_ORIGIN}/sitemap/${i}.xml`);
    }
  });

  it("allows the wildcard userAgent at root", () => {
    const wildcard = (result.rules as Array<{ userAgent: string; allow: string }>).find(
      (r) => r.userAgent === "*",
    );
    expect(wildcard?.allow).toBe("/");
  });

  it("disallows transactional + admin paths for the wildcard agent", () => {
    const wildcard = (result.rules as Array<{ userAgent: string; disallow: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    const disallow = wildcard?.disallow ?? [];
    for (const path of [
      "/api/", "/admin/", "/account/", "/cart/", "/checkout/",
      "/sign-in", "/login", "/strength-training/success", "/success/",
      "/thank-you", "/unsubscribe", "/preview/", "/draft/", "/_next/",
    ]) {
      expect(disallow).toContain(path);
    }
  });

  it("explicitly allows the AI search/crawler bots", () => {
    const userAgents = (result.rules as Array<{ userAgent: string }>).map(
      (r) => r.userAgent,
    );
    for (const bot of [
      "GPTBot", "ClaudeBot", "OAI-SearchBot", "ChatGPT-User",
      "PerplexityBot", "Perplexity-User", "Google-Extended", "GoogleOther",
      "Bingbot", "Applebot-Extended", "Meta-ExternalAgent", "cohere-ai",
      "Bytespider",
    ]) {
      expect(userAgents).toContain(bot);
    }
  });

  it("applies the same disallow list to every named bot — no leak via /admin", () => {
    const named = (result.rules as Array<{ userAgent: string; disallow: string[] }>)
      .filter((r) => r.userAgent !== "*");
    for (const r of named) {
      expect(r.disallow).toContain("/admin/");
      expect(r.disallow).toContain("/api/");
    }
  });
});
