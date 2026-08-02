import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Work_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { PodcastPlayerShell } from "@/components/features/podcast/PodcastPlayerShell";
import { ConversionChrome } from "@/components/layout/ConversionChrome";
import { LazyCookieConsent } from "@/components/features/consent/LazyCookieConsent";
import { ConsentRuntimeLoader } from "@/components/analytics/ConsentRuntimeLoader";
import { GoogleConsentMode } from "@/components/analytics/GoogleConsentMode";
import { ApplicationAttributionCapture } from "@/components/analytics/ApplicationAttributionCapture";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { RouteBreadcrumbJsonLd } from "@/components/seo/RouteBreadcrumbJsonLd";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { BRAND_STATS } from "@/lib/brand-facts";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Fonts used ONLY by the GlitchHero on the homepage. We still declare
// their CSS variables at the html level so any page that opts-in can
// reference them, but `preload: false` stops next/font from adding a
// <link rel="preload"> per route. On non-homepage routes they stay
// inert — no network request — and the homepage swaps them in via
// display: swap with a subtle FOUT that's invisible behind the
// coral/purple gradient hero.
const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  verification: {
    google: "o3SBYrUkEn4SxMHmX42sh0yFlSn4xP04UMSjGRM3wUg",
  },
  title: {
    default: "Roadman Cycling — Cycling Coaching, Training & Performance Podcast",
    template: "%s | Roadman Cycling",
  },
  // Default/site-wide meta description. Kept under 160 chars so it isn't
  // truncated in SERPs — pages that don't set their own description (incl.
  // the homepage) inherit this. The newsletter-reader stat lives on
  // /newsletter and in the OG copy; it's dropped here to stay within budget.
  description: `The cycling podcast with ${BRAND_STATS.podcastDownloadsLabel} downloads and ${BRAND_STATS.episodeCountLabel} episodes. Expert coaching, training plans, nutrition, and a community that refuses to settle.`,
  keywords: [
    "cycling podcast",
    "cycling training",
    "cycling coaching",
    "cycling nutrition",
    "FTP training",
    "zone 2 training",
    "cycling community",
    "Roadman Cycling",
    "Anthony Walsh",
    "Not Done Yet",
  ],
  authors: [{ name: "Anthony Walsh", url: "https://roadmancycling.com" }],
  creator: "Roadman Cycling",
  metadataBase: new URL("https://roadmancycling.com"),
  // NOTE: no `alternates.canonical` here. Metadata merges shallowly
  // (Next 16), so a canonical set on the root layout is inherited by
  // every page that doesn't override `alternates` — which made pages
  // like /method declare the homepage as their canonical and triggered
  // "Duplicate, Google chose different canonical than user" in Search
  // Console. The homepage sets its own canonical in app/page.tsx;
  // every other route sets its own. Pages with no canonical (noindex
  // funnel/thank-you surfaces) correctly emit none.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roadmancycling.com",
    siteName: "Roadman Cycling",
    title: "Roadman Cycling — Cycling Coaching, Training & Performance Podcast",
    description: `The podcast with ${BRAND_STATS.podcastDownloadsLabel} downloads. Expert cycling coaching, training, nutrition, and community. ${BRAND_STATS.episodeCountLabel} episodes.`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Roadman_Podcast",
    creator: "@Roadman_Podcast",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Roadman",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#210140",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${workSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
    >
      <head>
        <GoogleConsentMode />
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Roadman Cycling Podcast"
          href="https://roadmancycling.com/feed/podcast"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Roadman Cycling Blog"
          href="https://roadmancycling.com/feed/blog"
        />
      </head>
      <body className="min-h-screen bg-charcoal text-off-white font-body antialiased">
        <OrganizationJsonLd />
        <RouteBreadcrumbJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-coral focus:text-deep-purple focus:px-4 focus:py-2 focus:rounded-md focus:font-heading focus:text-sm focus:tracking-wider"
        >
          Skip to content
        </a>
        <PodcastPlayerShell>
          {children}
        </PodcastPlayerShell>
        <ApplicationAttributionCapture />
        <ConversionChrome />
        <LazyCookieConsent />
        <ConsentRuntimeLoader />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
