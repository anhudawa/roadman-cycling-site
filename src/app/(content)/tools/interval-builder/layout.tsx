import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Interval Session Builder | Roadman Cycling",
  description:
    "Enter your FTP, pick a training goal, and get a complete structured interval session with power targets, cadence, TSS estimate, and recovery guidance. Free tool.",
  keywords: ["interval session builder", "cycling intervals", "VO2max intervals", "threshold intervals", "sweet spot sessions", "cycling workout builder", "interval training cycling"],
  alternates: { canonical: "/tools/interval-builder" },
  openGraph: {
    title: "Interval Session Builder | Roadman Cycling",
    description:
      "Enter your FTP and training goal. Get a complete structured interval session with power targets, cadence, and TSS estimate. Free, no signup.",
    type: "website",
    url: "https://roadmancycling.com/tools/interval-builder",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="interval-builder" />
      {children}
      <ToolJourney slug="interval-builder" />
    </>
  );
}
