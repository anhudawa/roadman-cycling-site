import type { MetadataRoute } from "next";
import { SITEMAP_INDEX_URL } from "@/lib/seo/sitemaps";

/**
 * Non-indexable paths. The transactional ones (/cart, /checkout,
 * /account, /sign-in, /login) don't exist today but are listed
 * defensively so any future ClickFunnels-style route lands
 * non-indexable by default.
 *
 * IMPORTANT: only list paths here that should never be CRAWLED — API
 * endpoints, the admin app, build internals, preview/draft surfaces.
 * Do NOT add pages that we de-index another way (a `robots: noindex`
 * meta tag, or a 410/404 response). Disallowing those is
 * counterproductive: it stops Googlebot from fetching the page, so it
 * never sees the noindex/410 and the URL lingers as "Indexed, though
 * blocked by robots.txt" in Search Console. The conversion/thank-you
 * pages (/strength-training/success → noindex, /thank-you* → 410 Gone
 * via next.config.ts) are handled that way and must stay crawlable.
 */
const DISALLOW_PATHS = [
  "/api/",
  "/admin/",
  "/account/",
  "/cart/",
  "/checkout/",
  "/sign-in",
  "/login",
  "/unsubscribe",
  "/preview/",
  "/draft/",
  "/_next/",
];

// Crawlers must be able to fetch /_next/static/ so Googlebot and AI
// crawlers can render the page (JS, CSS, images live there). The blog
// hero endpoint is also intentionally referenced by Article/WebPage
// structured data as a stable, high-resolution image fallback, so it
// must remain crawlable even though the broader /api/ tree is blocked.
// Under the REP, the more-specific Allow wins.
const ALLOW_PATHS = ["/", "/_next/static/", "/api/og/blog-hero"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
      // AI search crawlers — explicitly allowed for AI SEO visibility.
      // Each gets the same disallow list so transactional paths are
      // never indexed regardless of which crawler found them.
      { userAgent: "GPTBot", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "ClaudeBot", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "OAI-SearchBot", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "ChatGPT-User", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "PerplexityBot", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Perplexity-User", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Google-Extended", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "GoogleOther", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Bingbot", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Applebot-Extended", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Meta-ExternalAgent", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "cohere-ai", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
      { userAgent: "Bytespider", allow: ALLOW_PATHS, disallow: DISALLOW_PATHS },
    ],
    // The index is the canonical discovery point for every child sitemap.
    // Listing children here as well duplicates signals and can drift when a
    // new partition is added.
    sitemap: SITEMAP_INDEX_URL,
  };
}
