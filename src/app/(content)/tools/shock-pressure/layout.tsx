import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "MTB Suspension Calculator: Fork & Shock Pressure + Sag",
  description:
    "Calculate MTB fork and rear-shock sag, plus manufacturer-backed starting pressure where an exact source supports it. FOX 38, FOX rear shock and RockShox lookup guidance.",
  keywords: [
    "mtb suspension calculator",
    "suspension calculator",
    "mtb suspension setup calculator",
    "shock pressure calculator",
    "fork pressure calculator",
    "fox suspension calculator",
    "rockshox suspension calculator",
    "mountain bike sag calculator",
  ],
  alternates: { canonical: "/tools/shock-pressure" },
  openGraph: {
    title: "MTB Suspension Calculator: Fork & Shock Pressure + Sag",
    description:
      "Calculate fork and rear-shock sag, use an exact manufacturer starting pressure where supported, and know when the official product lookup must take over.",
    type: "website",
    url: "https://roadmancycling.com/tools/shock-pressure",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="shock-pressure" />
      {children}
      <ToolJourney slug="shock-pressure" />
    </>
  );
}
