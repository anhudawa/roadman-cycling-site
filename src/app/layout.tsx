import type { Metadata } from "next";
import { Bebas_Neue, Work_Sans } from "next/font/google";
import { SmoothCursor } from "@/components/ui/SmoothCursor";
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
    "The podcast trusted by 100 million listeners. Expert cycling coaching, training plans, nutrition advice, and a community of serious cyclists who refuse to accept their best days are behind them.",
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
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://roadmancycling.com",
    siteName: "Roadman Cycling",
    title: "Roadman Cycling — Cycling Is Hard, We Make It Less Hard",
    description:
      "The podcast trusted by 100 million listeners. Expert cycling coaching, training, nutrition, and community.",
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
      <body className="min-h-screen bg-charcoal text-off-white font-body antialiased cursor-none md:cursor-none">
        <SmoothCursor />
        {children}
      </body>
    </html>
  );
}
