import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Hydration Calculator — How Much to Drink on the Bike",
  description:
    "Estimate your sweat losses and build a hydration plan for any ride — based on duration, intensity, temperature, and body weight. Includes sodium guidance and bottle count.",
  keywords: ["cycling hydration calculator", "sweat rate calculator cycling", "how much to drink cycling", "cycling fluid intake", "electrolyte calculator cycling"],
  alternates: { canonical: "/tools/hydration" },
  openGraph: {
    title: "Hydration Calculator — How Much to Drink on the Bike",
    description:
      "Estimate sweat losses and build a hydration plan for any ride. Sodium guidance and bottle count included.",
    type: "website",
    url: "https://roadmancycling.com/tools/hydration",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="hydration" />
      {children}
      <ToolJourney slug="hydration" />
    </>
  );
}
