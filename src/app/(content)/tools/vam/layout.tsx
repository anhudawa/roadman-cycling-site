import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "VAM Calculator — Climbing Speed for Cyclists (Metres/Hour)",
  description:
    "Calculate your VAM (vertical ascent rate) from elevation and time. See where you rank against amateur and pro benchmarks, estimate your climbing W/kg, and compare against famous cols.",
  keywords: ["VAM calculator", "cycling climbing speed", "vertical ascent metres per hour", "climbing power cycling", "VAM cycling benchmark"],
  alternates: { canonical: "/tools/vam" },
  openGraph: {
    title: "VAM Calculator — Climbing Speed for Cyclists (Metres/Hour)",
    description:
      "Calculate your VAM from elevation and time. Amateur-to-pro benchmarks, climbing W/kg estimate, and famous col comparisons.",
    type: "website",
    url: "https://roadmancycling.com/tools/vam",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="vam" />
      {children}
      <ToolJourney slug="vam" />
    </>
  );
}
