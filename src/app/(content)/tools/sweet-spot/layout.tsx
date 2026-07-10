import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Sweet Spot Calculator | Roadman Cycling",
  description:
    "Enter your FTP to get your sweet spot power range (88-94%), ready-made interval sessions, and weekly volume guidance. Free tool — no signup.",
  keywords: ["sweet spot calculator", "sweet spot training", "FTP sweet spot", "cycling sweet spot zones", "sweet spot intervals"],
  alternates: { canonical: "/tools/sweet-spot" },
  openGraph: {
    title: "Sweet Spot Calculator | Roadman Cycling",
    description:
      "Enter your FTP to get your sweet spot power range, interval sessions, and weekly volume guidance. Free, no signup.",
    type: "website",
    url: "https://roadmancycling.com/tools/sweet-spot",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="sweet-spot" />
      {children}
      <ToolJourney slug="sweet-spot" />
    </>
  );
}
