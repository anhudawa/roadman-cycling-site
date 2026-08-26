import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling to Running Conversion Calculator (2026)",
  description:
    "Convert running and cycling distance or time with published 2024 MET values. See an energy-cost match plus clear limits on fitness, impact and training.",
  keywords: [
    "cycling to running conversion calculator",
    "running to cycling conversion",
    "cycling to running equivalent",
    "biking miles to running miles",
    "running cycling ratio",
  ],
  alternates: { canonical: "/tools/run-ride-converter" },
  openGraph: {
    title: "Cycling to Running Conversion Calculator",
    description:
      "Match a run and ride by population-average energy cost with published MET values and explicit limits.",
    type: "website",
    url: "https://roadmancycling.com/tools/run-ride-converter",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="run-ride-converter" />
      {children}
      <ToolJourney slug="run-ride-converter" />
    </>
  );
}
