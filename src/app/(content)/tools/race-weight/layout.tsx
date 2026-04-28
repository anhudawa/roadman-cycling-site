import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Race Weight Calculator — Peak Cycling Weight",
  description:
    "Calculate your target race weight based on body composition and event type. Free cycling tool based on competitive cyclist reference ranges.",
  keywords: ["race weight calculator", "cycling race weight", "cycling body composition", "power to weight cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/race-weight" },
  openGraph: {
    title: "Race Weight Calculator — Peak Cycling Weight",
    description:
      "Calculate your target race weight based on body composition and event type. Free cycling tool based on competitive cyclist reference ranges.",
    type: "website",
    url: "https://roadmancycling.com/tools/race-weight",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="race-weight" />
      {children}
    </>
  );
}
