import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * Non-indexable paths. The transactional ones (/cart, /checkout,
 * /account, /sign-in, /login) don't exist today but are listed
 * defensively so any future ClickFunnels-style route lands
 * non-indexable by default.
 */
const DISALLOW_PATHS = [
  "/api/",
  "/admin/",
  "/account/",
  "/cart/",
  "/checkout/",
  "/sign-in",
  "/login",
  "/strength-training/success",
  "/success/",
  "/thank-you",
  "/unsubscribe",
  "/preview/",
  "/draft/",
  "/_next/",
];

// Crawlers must be able to fetch /_next/static/ so Googlebot and AI
// crawlers can render the page (JS, CSS, images live there). The
// broader /_next/ tree stays disallowed so build-internal routes
// don't get indexed. Under the REP, the more-specific Allow wins.
const ALLOW_PATHS = ["/", "/_next/static/"];

const SITEMAPS = [
  `${SITE_ORIGIN}/sitemap-index.xml`,
  `${SITE_ORIGIN}/sitemap/0.xml`,
  `${SITE_ORIGIN}/sitemap/1.xml`,
  `${SITE_ORIGIN}/sitemap/2.xml`,
  `${SITE_ORIGIN}/sitemap/3.xml`,
  `${SITE_ORIGIN}/sitemap/4.xml`,
  `${SITE_ORIGIN}/sitemap/5.xml`,
];

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
    sitemap: SITEMAPS,
  };
}
