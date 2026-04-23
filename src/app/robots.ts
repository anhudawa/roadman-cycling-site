import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/strength-training/success",
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
    sitemap: [
      "https://roadmancycling.com/sitemap/0.xml",
      "https://roadmancycling.com/sitemap/1.xml",
      "https://roadmancycling.com/sitemap/2.xml",
      "https://roadmancycling.com/sitemap/3.xml",
      "https://roadmancycling.com/sitemap/4.xml",
      "https://roadmancycling.com/sitemap/5.xml",
    ],
  };
}
