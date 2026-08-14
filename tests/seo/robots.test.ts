import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { SITE_ORIGIN } from "@/lib/brand-facts";

describe("/robots.ts", () => {
  const result = robots();

  it("includes the canonical sitemap-index.xml", () => {
    expect(result.sitemap).toContain(`${SITE_ORIGIN}/sitemap-index.xml`);
  });

  it("uses the sitemap index as the single crawler discovery point", () => {
    expect(result.sitemap).toBe(`${SITE_ORIGIN}/sitemap-index.xml`);
  });

  it("allows the wildcard userAgent at root and on /_next/static/", () => {
    const wildcard = (result.rules as Array<{ userAgent: string; allow: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    expect(wildcard?.allow).toContain("/");
    // /_next/static/ must be crawlable so Googlebot and AI crawlers can
    // fetch the JS/CSS bundles needed to render the page; the broader
    // /_next/ tree stays disallowed.
    expect(wildcard?.allow).toContain("/_next/static/");
  });

  it("disallows transactional + admin + build-internal paths for the wildcard agent", () => {
    const wildcard = (result.rules as Array<{ userAgent: string; disallow: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    const disallow = wildcard?.disallow ?? [];
    for (const path of [
      "/api/", "/admin/", "/account/", "/cart/", "/checkout/",
      "/sign-in", "/login", "/unsubscribe", "/preview/", "/draft/", "/_next/",
    ]) {
      expect(disallow).toContain(path);
    }
  });

  it("does NOT disallow pages that de-index themselves via noindex or 410", () => {
    // Blocking these in robots.txt stops Googlebot fetching them, so it
    // never sees the noindex / 410 Gone and the URL lingers as "Indexed,
    // though blocked by robots.txt". /strength-training/success sets a
    // noindex meta; /thank-you* is rewritten to a 410 in next.config.ts.
    const wildcard = (result.rules as Array<{ userAgent: string; disallow: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    const disallow = wildcard?.disallow ?? [];
    for (const path of ["/strength-training/success", "/success/", "/thank-you"]) {
      expect(disallow).not.toContain(path);
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
