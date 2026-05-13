import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Fuelling Calculator — Carbs, Fluid & Sodium Per Hour",
  description:
    "Exactly what to eat and drink, hour by hour. Carbs, fluid and sodium calibrated to your weight, intensity and ride length — the modern fuelling numbers, not the 2014 ones.",
  keywords: ["cycling fuelling calculator", "carbs per hour cycling", "cycling nutrition calculator", "in ride nutrition"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "Cycling Fuelling Calculator — Carbs, Fluid & Sodium Per Hour",
    description:
      "Exactly what to eat and drink, hour by hour. Carbs, fluid and sodium calibrated to your weight, intensity and ride length.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="fuelling" />
      {children}
      <ToolJourney slug="fuelling" />
    </>
  );
}
