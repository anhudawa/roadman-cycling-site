import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Gear Ratio Calculator — Gear Inches, Development & Speed at Cadence",
  description:
    "Map every chainring and cassette combination to gear ratios, gear inches, meters of development, and speed at cadence. Visual overlap chart shows redundant gears and gaps.",
  keywords: [
    "gear ratio calculator",
    "cycling gear inches",
    "gear development",
    "chainring cassette calculator",
    "speed at cadence",
    "gear overlap chart",
  ],
  alternates: { canonical: "/tools/gear-ratio" },
  openGraph: {
    title: "Gear Ratio Calculator — Gear Inches, Development & Speed at Cadence",
    description:
      "Map every chainring and cassette combination to gear ratios, gear inches, meters of development, and speed at cadence. Visual overlap chart included.",
    type: "website",
    url: "https://roadmancycling.com/tools/gear-ratio",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="gear-ratio" />
      {children}
      <ToolJourney slug="gear-ratio" />
    </>
  );
}
