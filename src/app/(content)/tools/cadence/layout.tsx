import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cadence Calculator — Find Your Optimal RPM for Any Gear & Speed",
  description: "Calculate cycling cadence from speed, gear ratio, and wheel size — or find your speed at any RPM. Includes cadence zone benchmarks and what the research says about optimal pedalling rate.",
  keywords: ["cadence calculator cycling", "optimal cycling cadence", "RPM calculator bike", "cycling cadence zones", "pedalling rate calculator"],
  alternates: { canonical: "/tools/cadence" },
  openGraph: {
    title: "Cadence Calculator — Find Your Optimal RPM for Any Gear & Speed",
    description: "Calculate cycling cadence from speed, gear ratio, and wheel size. Cadence zone benchmarks and research-backed guidance included.",
    type: "website",
    url: "https://roadmancycling.com/tools/cadence",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="cadence" />
      {children}
      <ToolJourney slug="cadence" />
    </>
  );
}
