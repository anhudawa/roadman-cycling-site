import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Race Weight Calculator — Peak Cycling Weight",
  description:
    "Calculate your target race weight based on body composition and event type. Free cycling tool based on competitive cyclist reference ranges.",
  keywords: ["race weight calculator", "cycling race weight", "cycling body composition", "power to weight cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/race-weight" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Calculate Race Weight"
        description="Calculate your target race weight range for peak cycling performance based on body composition, gender, and event type rather than BMI."
        totalTime="PT3M"
        steps={[
          { name: "Enter your body measurements", text: "Input your height in centimetres, current weight in kilograms, and estimated body fat percentage. A smart scale or caliper test gives the most accurate body fat reading." },
          { name: "Select your gender and event type", text: "Choose your gender and target event (road race, gran fondo, hill climb, time trial, or gravel). Each event type has different optimal body fat ranges based on sports science literature." },
          { name: "Review your target weight range", text: "The calculator outputs a target weight range and body fat percentage based on your lean mass and event-specific reference ranges from Jeukendrup and Gleeson research." },
          { name: "Follow the recommended timeline", text: "The calculator estimates weeks to reach your target at a safe rate of 0.5% body weight per week. Focus on protein adequacy (1.6-2.2g/kg) and fuelling key sessions rather than crash dieting." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "Race Weight Calculator", item: "https://roadmancycling.com/tools/race-weight" },
          ],
        }}
      />
      {children}
    </>
  );
}
