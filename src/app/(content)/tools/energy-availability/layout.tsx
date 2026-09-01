import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Energy Availability Estimator for Cyclists",
  description:
    "Estimate energy availability from intake, exercise expenditure and fat-free mass. Educational context for cyclists—not a RED-S screening or diagnostic test.",
  keywords: ["energy availability calculator", "RED-S cycling", "cyclist energy availability", "relative energy deficiency"],
  alternates: { canonical: "/tools/energy-availability" },
  openGraph: {
    title: "Energy Availability Estimator for Cyclists",
    description:
      "Estimate energy availability and understand the limits of the 30 and 45 kcal/kg FFM research reference points.",
    type: "website",
    url: "https://roadmancycling.com/tools/energy-availability",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="energy-availability" />
      {children}
      <ToolJourney slug="energy-availability" />
    </>
  );
}
