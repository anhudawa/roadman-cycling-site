import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Road Bike Tyre Pressure Calculator — 15% Drop (2026)",
  description:
    "Calculate optimal front and rear tyre pressure based on rider weight, tyre width, road surface, and conditions. Free cycling tool from Roadman Cycling.",
  keywords: ["tyre pressure calculator cycling", "bike tyre pressure", "cycling PSI calculator", "optimal tyre pressure"],
  alternates: { canonical: "https://roadmancycling.com/tools/tyre-pressure" },
  openGraph: {
    title: "Road Bike Tyre Pressure Calculator — 15% Drop (2026)",
    description:
      "Calculate optimal front and rear tyre pressure based on rider weight, tyre width, road surface, and conditions. Free cycling tool from Roadman Cycling.",
    type: "website",
    url: "https://roadmancycling.com/tools/tyre-pressure",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="tyre-pressure" />
      {children}
    </>
  );
}
