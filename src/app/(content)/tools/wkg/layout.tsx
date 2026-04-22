import type { Metadata } from "next";
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
