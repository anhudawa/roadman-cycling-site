import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "W/kg Calculator — Cycling Power-to-Weight Ratio",
  description:
    "Calculate your cycling power-to-weight ratio (W/kg) instantly. Compare against amateur, competitive, and professional benchmarks.",
  keywords: ["w/kg calculator", "watts per kg cycling", "power to weight ratio", "cycling w/kg"],
  alternates: { canonical: "https://roadmancycling.com/tools/wkg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="W/kg Calculator"
        description="Calculate your cycling power-to-weight ratio and compare against performance benchmarks."
        url="https://roadmancycling.com/tools/wkg"
        features={["Instant W/kg calculation", "Performance level benchmarks", "Improvement recommendations"]}
      />
      <HowToSchema
        name="How to Calculate Cycling Power-to-Weight Ratio (W/kg)"
        description="Calculate your cycling power-to-weight ratio by dividing your FTP in watts by your body weight in kilograms, and benchmark the result against amateur, competitive, and professional reference ranges."
        totalTime="PT1M"
        steps={[
          { name: "Determine your FTP", text: "Complete a 20-minute all-out test on a power meter or smart trainer, then multiply your average power by 0.95. A ramp test on Zwift or TrainerRoad is an acceptable alternative." },
          { name: "Weigh yourself consistently", text: "Record body weight first thing in the morning, after the bathroom, before eating or drinking. Do this on 3-4 consecutive days and average the result to eliminate day-to-day noise." },
          { name: "Divide watts by kilograms", text: "Divide your FTP in watts by your body weight in kilograms. For example, 260W / 72kg = 3.61 W/kg. This is the single best predictor of climbing and overall road cycling performance." },
          { name: "Compare against benchmarks", text: "Recreational riders sit around 1.5-2.5 W/kg, competitive amateurs 3.0-3.5, strong amateurs 3.5-4.0, elite amateurs 4.0-4.5, and professionals 5.0+. Grand Tour climbers exceed 6.0 W/kg on a 20-minute climb." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "W/kg Calculator", item: "https://roadmancycling.com/tools/wkg" },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is a good W/kg for cycling?",
              acceptedAnswer: { "@type": "Answer", text: "Recreational: 1.5-2.5 W/kg. Fitness cyclist: 2.5-3.0. Competitive amateur: 3.0-3.5. Strong amateur: 3.5-4.0. Elite: 4.0-4.5. Professional: 5.0+. Grand Tour climbers: 6.0+." },
            },
            {
              "@type": "Question",
              name: "How do I improve my W/kg?",
              acceptedAnswer: { "@type": "Answer", text: "Two levers: increase FTP through structured training (polarised model, threshold intervals, consistency) or decrease body weight through the fuel-for-the-work-required framework. Most amateurs improve fastest through body composition changes." },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
