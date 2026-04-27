import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "shiki", "rehype-pretty-code"],
  },
  async redirects() {
    const COACHING_SUBDOMAIN = [
      { type: "host" as const, value: "coaching.roadmancycling.com" },
    ];
    return [
      // ==========================================================
      // coaching.roadmancycling.com subdomain retirement
      // ----------------------------------------------------------
      // Legacy ClickFunnels subdomain. DNS already points at Vercel
      // but the subdomain is not currently attached to this project,
      // so every path returns a Vercel DEPLOYMENT_NOT_FOUND 404.
      // Once the subdomain is added as a domain on this project,
      // these host-aware rules consolidate all legacy traffic onto
      // the apex. Must come BEFORE the generic apex redirects below.
      // ==========================================================
      // Blog URLs: preserve path (apex has the canonical versions)
      {
        source: "/blog/:slug*",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/blog/:slug*",
        permanent: true,
      },
      // 14-Day Kickstart Challenge — retired product; closest match is /apply
      {
        source: "/14day",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/apply",
        permanent: true,
      },
      // "It works" testimonials page → coaching landing (has testimonials inline)
      {
        source: "/itworks",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // ClickFunnels opt-in pages (pattern: /optin-<anything>).
      // Path-to-regexp v8 (Next.js 16+) rejects `:rest*` without a
      // slash prefix — the `-` separator doesn't count. Using an
      // inline regex `(.*)` to match any suffix instead.
      {
        source: "/optin-:rest(.*)",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/apply",
        permanent: true,
      },
      // ClickFunnels raw template slugs (pattern: /roadmancc<anything>)
      {
        source: "/roadmancc:rest(.*)",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // Subdomain root
      {
        source: "/",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // ==========================================================
      // Existing apex-domain redirects begin here.
      // These have no host filter and will ALSO fire for subdomain
      // traffic when the path matches — which is the desired
      // fall-through behaviour for slugs like /members, /strong,
      // /self-coaching-system etc. that may have been used on
      // both hosts historically.
      // ==========================================================
      // Redirect old ClickFunnels paths to new site equivalents
      {
        source: "/members",
        destination: "/community/clubhouse",
        permanent: true,
      },
      {
        source: "/2026",
        destination: "/apply",
        permanent: false,
      },
      {
        source: "/strong",
        destination: "/strength-training",
        permanent: true,
      },
      {
        source: "/self-coaching-system",
        destination: "/community/not-done-yet",
        permanent: true,
      },
      {
        source: "/application-funnel-6",
        destination: "/community/not-done-yet",
        permanent: true,
      },

      // Old site structure → new equivalents
      { source: "/shop", destination: "/tools", permanent: true },
      { source: "/store", destination: "/tools", permanent: true },
      { source: "/products", destination: "/tools", permanent: true },
      { source: "/join", destination: "/apply", permanent: true },
      { source: "/signup", destination: "/apply", permanent: true },
      { source: "/sign-up", destination: "/apply", permanent: true },
      { source: "/register", destination: "/apply", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-me", destination: "/about", permanent: true },
      { source: "/services", destination: "/coaching", permanent: true },
      { source: "/pricing", destination: "/coaching", permanent: true },
      { source: "/prices", destination: "/coaching", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/club", destination: "/community/club", permanent: true },
      { source: "/free-trial", destination: "/apply", permanent: true },
      { source: "/trial", destination: "/apply", permanent: true },
      { source: "/coaching-application", destination: "/apply", permanent: true },
      { source: "/apply-now", destination: "/apply", permanent: true },
      { source: "/ndy", destination: "/community/not-done-yet", permanent: true },
      { source: "/not-done-yet", destination: "/community/not-done-yet", permanent: true },
      { source: "/episodes", destination: "/podcast", permanent: true },
      { source: "/listen", destination: "/podcast", permanent: true },
      { source: "/calculators", destination: "/tools", permanent: true },
      { source: "/ftp-calculator", destination: "/tools/ftp-zones", permanent: true },
      { source: "/ftp", destination: "/tools/ftp-zones", permanent: true },
      { source: "/tyre-pressure", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/tire-pressure", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/race-weight", destination: "/tools/race-weight", permanent: true },
      { source: "/fuelling", destination: "/tools/fuelling", permanent: true },
      { source: "/fueling", destination: "/tools/fuelling", permanent: true },
      { source: "/energy-availability", destination: "/tools/energy-availability", permanent: true },
      { source: "/press", destination: "/about/press", permanent: true },
      { source: "/media", destination: "/about/press", permanent: true },
      { source: "/sponsors", destination: "/partners", permanent: true },
      { source: "/sponsorship", destination: "/partners", permanent: true },
      { source: "/coaching-ireland", destination: "/coaching/ireland", permanent: true },
      { source: "/coaching-uk", destination: "/coaching/uk", permanent: true },
      { source: "/coaching-usa", destination: "/coaching/usa", permanent: true },
      { source: "/triathlon", destination: "/coaching/triathlon", permanent: true },
      { source: "/triathlon-coaching", destination: "/coaching/triathlon", permanent: true },
      { source: "/plans", destination: "/plan", permanent: true },
      { source: "/training-plans", destination: "/plan", permanent: true },
      { source: "/training-plan", destination: "/plan", permanent: true },
      { source: "/community/skool", destination: "/community/clubhouse", permanent: true },
      { source: "/skool", destination: "/community/clubhouse", permanent: true },
      { source: "/blog/i-lost-7kg-eating-more-cycling", destination: "/blog/cycling-weight-loss-fuel-for-the-work-required", permanent: true },
      { source: "/blog/cycling-periodisation-training", destination: "/blog/cycling-periodisation-plan-guide", permanent: true },
      // ClickFunnels funnel pages — P0 redirects (revenue + backlinks)
      { source: "/2026-optin", destination: "/apply", permanent: true },
      { source: "/application", destination: "/apply", permanent: true },
      { source: "/strength", destination: "/strength-training", permanent: true },
      { source: "/work-with-anthony", destination: "/coaching", permanent: true },
      { source: "/one-on-one-coaching", destination: "/coaching", permanent: true },
      { source: "/one-on-one-call", destination: "/coaching", permanent: true },
      { source: "/roadman-club-membership", destination: "/community/club", permanent: true },
      { source: "/roadman-cookbook-bundle", destination: "/tools", permanent: true },

      // ClickFunnels funnel pages — P1 redirects
      { source: "/tyre-pressure-2", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/tyre-pressure-2-copy", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/optin", destination: "/apply", permanent: true },
      { source: "/getstrong", destination: "/strength-training", permanent: true },
      { source: "/s-c-plan", destination: "/strength-training", permanent: true },

      // Episode count slug update — old URL had 1300, corrected to 1400
      {
        source: "/blog/common-training-mistakes-from-1300-podcast-episodes",
        destination: "/blog/common-training-mistakes-from-1400-podcast-episodes",
        permanent: true,
      },
      // Consolidated duplicate blog posts — keep canonical, 301 the dupes
      {
        source: "/blog/best-cycling-podcasts-for-2026-edition",
        destination: "/blog/best-cycling-podcasts-2026",
        permanent: true,
      },
      {
        source: "/blog/cycling-coach-near-me-why-location-doesnt-matter",
        destination: "/blog/cycling-coach-near-me-why-location-doesnt-matter-2026",
        permanent: true,
      },
      {
        source: "/blog/online-cycling-coach-cost",
        destination: "/blog/how-much-does-online-cycling-coach-cost-2026",
        permanent: true,
      },
      {
        source: "/blog/cycling-coaching-cost-guide",
        destination: "/blog/how-much-does-online-cycling-coach-cost-2026",
        permanent: true,
      },
      {
        source: "/blog/trainerroad-vs-coaching",
        destination: "/blog/trainerroad-vs-online-cycling-coach",
        permanent: true,
      },

      // Today's Plan has shut down as a product — the old comparison
      // page is now framed as TrainingPeaks vs Vekta at a new slug.
      {
        source: "/compare/trainingpeaks-vs-todays-plan",
        destination: "/compare/trainingpeaks-vs-vekta",
        permanent: true,
      },

      // ClickFunnels orphan landing pages — P2 redirects
      { source: "/tyre-pressure-2-page--64de3", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/toolkit2-page", destination: "/tools", permanent: true },
      { source: "/optin-page", destination: "/apply", permanent: true },
      { source: "/application-page", destination: "/apply", permanent: true },
      { source: "/copy-of-the-perfect-squeeze-page-d3318--8234c", destination: "/tools", permanent: true },

      // ==========================================================
      // coaching.roadmancycling.com subdomain catch-all
      // ----------------------------------------------------------
      // This fires only when the host is coaching.roadmancycling.com
      // AND no earlier rule matched. Any orphan ClickFunnels URL that
      // we haven't explicitly listed above goes to /coaching rather
      // than a broken Vercel 404.
      // ==========================================================
      {
        source: "/:path*",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // /sitemap.xml is the canonical URL crawlers (and our own llms.txt /
        // llms-full.txt) reference. Next.js 16's generateSitemaps() emits
        // /sitemap/0.xml … /sitemap/N.xml but does NOT auto-emit an index at
        // /sitemap.xml, and adding a route handler at that path collides with
        // the metadata-file convention. The rewrite serves the existing
        // /sitemap-index.xml handler under the canonical /sitemap.xml URL.
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
        // ClickFunnels dead URLs → 410 Gone (thank-you pages, checkout forms,
        // template demos, archived funnels). Rewrite to /api/gone which returns 410.
        { source: "/thank-you-1", destination: "/api/gone" },
        { source: "/thank-you", destination: "/api/gone" },
        { source: "/thank-you-minimal", destination: "/api/gone" },
        { source: "/thank-you--1dbf8", destination: "/api/gone" },
        { source: "/thank-you-page--7d9f9", destination: "/api/gone" },
        { source: "/thank-you-page--87843", destination: "/api/gone" },
        { source: "/application-thank-you", destination: "/api/gone" },
        { source: "/s-c-order-form", destination: "/api/gone" },
        { source: "/s-c-order-confirmed", destination: "/api/gone" },
        { source: "/confirmation--5562c", destination: "/api/gone" },
        { source: "/anthony-walsh", destination: "/api/gone" },
        { source: "/grow-with-the-flow-order-form", destination: "/api/gone" },
        { source: "/gwtf-strategy-session-optin", destination: "/api/gone" },
        { source: "/creator-theme---product", destination: "/api/gone" },
        { source: "/my-example-page", destination: "/api/gone" },
        { source: "/course-theme---product", destination: "/api/gone" },
        { source: "/oto-page--958bb--25bd3", destination: "/api/gone" },
        { source: "/2-step-book-page-page", destination: "/api/gone" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
