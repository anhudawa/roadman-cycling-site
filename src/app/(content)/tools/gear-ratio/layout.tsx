import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Bike Gear Ratio Calculator — Speed, Gear Inches & Development",
  description:
    "Free bike gear ratio calculator for exact chainring and cassette combinations. Compare speed at cadence, gear inches, development, range, overlap and custom wheel rollout.",
  keywords: [
    "bike gear ratio calculator",
    "bicycle gear ratio calculator",
    "cycling gear inches",
    "gear development",
    "chainring cassette calculator",
    "speed at cadence",
    "gear overlap chart",
  ],
  alternates: { canonical: "/tools/gear-ratio" },
  openGraph: {
    title: "Bike Gear Ratio Calculator — Speed, Gear Inches & Development",
    description:
      "Compare exact chainring and cassette combinations, speed at cadence, gear inches, development, range and overlap.",
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
