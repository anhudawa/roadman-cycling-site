import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Energy Availability Calculator — RED-S Risk",
  description:
    "Free energy availability calculator for cyclists. Find out if you're eating enough to train, recover, and avoid RED-S. Based on fat-free mass and training load.",
  keywords: ["energy availability calculator", "RED-S cycling", "cyclist energy availability", "relative energy deficiency"],
  alternates: { canonical: "https://roadmancycling.com/tools/energy-availability" },
  openGraph: {
    title: "Energy Availability Calculator — RED-S Risk",
    description:
      "Free energy availability calculator for cyclists. Find out if you're eating enough to train, recover, and avoid RED-S. Based on fat-free mass and training load.",
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
    </>
  );
}
