import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Energy Availability Calculator — RED-S Risk for Cyclists",
  description:
    "Are you eating enough to train, recover and stay healthy? Free RED-S screener for cyclists, built on fat-free mass and training load. Find out before your body tells you.",
  keywords: ["energy availability calculator", "RED-S cycling", "cyclist energy availability", "relative energy deficiency"],
  alternates: { canonical: "/tools/energy-availability" },
  openGraph: {
    title: "Energy Availability Calculator — RED-S Risk for Cyclists",
    description:
      "Are you eating enough to train, recover and stay healthy? Free RED-S screener for cyclists, built on fat-free mass and training load.",
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
