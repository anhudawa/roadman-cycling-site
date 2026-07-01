import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Road Bike Tyre Pressure Calculator — 15% Drop Method (2026)",
  description:
    "Optimal front and rear PSI for your weight, tyre width and surface — built on the 15% drop method most World Tour teams now use. Faster, more comfortable, fewer pinch flats.",
  keywords: ["tyre pressure calculator cycling", "bike tyre pressure", "cycling PSI calculator", "optimal tyre pressure"],
  alternates: { canonical: "/tools/tyre-pressure" },
  openGraph: {
    title: "Road Bike Tyre Pressure Calculator — 15% Drop Method (2026)",
    description:
      "Optimal front and rear PSI for your weight, tyre width and surface — built on the 15% drop method most World Tour teams now use.",
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
      <ToolJourney slug="tyre-pressure" />
    </>
  );
}
