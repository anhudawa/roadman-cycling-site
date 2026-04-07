import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "In-Ride Fuelling Calculator — Carbs Per Hour for Cycling",
  description:
    "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
  keywords: ["cycling fuelling calculator", "carbs per hour cycling", "cycling nutrition calculator", "in ride nutrition"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Calculate In-Ride Fuelling"
        description="Calculate your optimal carbohydrate intake, fluid requirements, and sodium needs per hour for cycling based on ride duration, intensity, and body weight."
        totalTime="PT2M"
        steps={[
          { name: "Enter ride duration", text: "Input your planned ride duration in minutes. Fuelling needs scale significantly with duration — rides under 60 minutes need minimal fuelling, while rides over 3 hours require a structured plan." },
          { name: "Select ride intensity", text: "Choose your ride intensity level: easy (Zone 2), moderate (Zone 3), hard (Zone 4-5), or race effort. Higher intensity increases carbohydrate oxidation rates and fluid loss." },
          { name: "Enter your body weight", text: "Input your body weight in kilograms. Fluid requirements are calculated relative to body weight at 6-10ml/kg/hr depending on intensity." },
          { name: "Follow your fuelling plan", text: "The calculator outputs carbs per hour, fluid per hour, total carbs, and sodium recommendations. For rides over 90 minutes, use dual-source carbs (glucose and fructose at 1:0.8 ratio) to absorb up to 120g per hour." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "In-Ride Fuelling Calculator", item: "https://roadmancycling.com/tools/fuelling" },
          ],
        }}
      />
      {children}
    </>
  );
}
