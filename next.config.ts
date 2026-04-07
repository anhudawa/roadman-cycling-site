import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  async redirects() {
    return [
      // Redirect old ClickFunnels paths to new site equivalents
      {
        source: "/members",
        destination: "/community/clubhouse",
        permanent: true,
      },
      {
        source: "/2026",
        destination: "/community/not-done-yet",
        permanent: true,
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
    ];
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
    ];
  },
};

export default nextConfig;
