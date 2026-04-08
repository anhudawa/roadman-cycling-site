import type { Metadata } from "next";
import { Bebas_Neue, Work_Sans } from "next/font/google";
import Script from "next/script";
import { SmoothCursorWrapper } from "@/components/ui/SmoothCursorWrapper";
import { PodcastPlayerShell } from "@/components/features/podcast/PodcastPlayerShell";
import { LazyExitIntent } from "@/components/features/conversion/LazyExitIntent";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
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

export const metadata: Metadata = {
  title: {
    default: "Roadman Cycling — Cycling Is Hard, We Make It Less Hard",
    template: "%s | Roadman Cycling",
  },
  description:
    "The cycling podcast trusted by 1M+ monthly listeners. Expert coaching, training plans, nutrition, and a community that refuses to settle.",
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
  alternates: {
    canonical: "https://roadmancycling.com",
    languages: { en: "https://roadmancycling.com" },
  },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://roadmancycling.com",
    siteName: "Roadman Cycling",
    title: "Roadman Cycling — Cycling Is Hard, We Make It Less Hard",
    description:
      "The podcast trusted by 1 million monthly listeners. Expert cycling coaching, training, nutrition, and community.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${workSans.variable} dark`}
    >
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Roadman Cycling Podcast"
          href="https://roadmancycling.com/feed/podcast"
        />
      </head>
      <body className="min-h-screen bg-charcoal text-off-white font-body antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-coral focus:text-off-white focus:px-4 focus:py-2 focus:rounded-md focus:font-heading focus:text-sm focus:tracking-wider"
        >
          Skip to content
        </a>
        <SmoothCursorWrapper />
        <PodcastPlayerShell>
          {children}
        </PodcastPlayerShell>
        <LazyExitIntent />

        {/* Meta Pixel — deferred to avoid blocking initial paint */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '649389789190949');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=649389789190949&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
