import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Road Bike Tyre Pressure Calculator: Front & Rear PSI",
  description:
    "Calculate front and rear road bike tyre pressure in PSI and bar from system weight, measured tyre width and surface, with hookless safety checks.",
  keywords: [
    "road bike tyre pressure calculator",
    "bike tire pressure calculator",
    "cycling PSI calculator",
    "road bike tyre pressure",
  ],
  alternates: { canonical: "/tools/tyre-pressure" },
  openGraph: {
    title: "Road Bike Tyre Pressure Calculator: Front & Rear PSI",
    description:
      "Calculate front and rear PSI and bar from system weight, measured tyre width and surface, with hookless safety checks.",
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
