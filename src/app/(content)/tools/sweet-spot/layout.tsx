import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Sweet Spot Calculator | Roadman Cycling",
  description:
    "Calculate the common 88-94% FTP sweet spot band, compare neighbouring ranges, and review response-led sample sessions. Free tool — no signup.",
  keywords: ["sweet spot calculator", "sweet spot training", "FTP sweet spot", "cycling sweet spot zones", "sweet spot intervals"],
  alternates: { canonical: "/tools/sweet-spot" },
  openGraph: {
    title: "Sweet Spot Calculator | Roadman Cycling",
    description:
      "Calculate the common sweet spot FTP band and review sample interval structures with clear evidence and dosing limits. Free, no signup.",
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
