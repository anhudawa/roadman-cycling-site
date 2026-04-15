import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/strength-training/success",
          "/blood-engine/preview",
          "/blood-engine/dashboard",
          "/blood-engine/new",
          "/blood-engine/report",
          "/blood-engine/compare",
          "/blood-engine/account",
          "/blood-engine/login",
        ],
      },
      // AI search crawlers — explicitly allowed for AI SEO visibility
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: "https://roadmancycling.com/sitemap.xml",
  };
}
