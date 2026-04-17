import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

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
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Cyclist Energy Availability Calculator"
        description="Calculate your energy availability (EA) score from fat-free mass and training load to screen for RED-S risk. Free browser-based tool for endurance athletes."
        url="https://roadmancycling.com/tools/energy-availability"
        features={[
          "EA score in kcal/kg fat-free mass",
          "Training-load adjusted energy deficit estimate",
          "RED-S risk banding (low / optimal / at-risk)",
          "Based on IOC RED-S consensus thresholds",
        ]}
      />
      <HowToSchema
        name="How to Calculate Energy Availability"
        description="Calculate your energy availability (EA) score to assess whether you are eating enough to support your cycling training and overall health, and screen for RED-S risk."
        totalTime="PT3M"
        steps={[
          { name: "Enter daily calorie intake", text: "Input your total daily energy intake in kilocalories. Use a food diary or tracking app for the most accurate figure over a 3-7 day average." },
          { name: "Enter exercise energy expenditure", text: "Input the calories burned during exercise. Use a power meter (kJ roughly equals kcal) or heart rate monitor estimate. Include all structured training sessions." },
          { name: "Enter fat-free mass", text: "Input your fat-free mass (lean body mass) in kilograms. Calculate this from your body weight and body fat percentage: FFM = weight x (1 - body fat %). A DEXA scan gives the most accurate reading." },
          { name: "Review your EA score", text: "Energy availability is calculated as (Energy Intake - Exercise Energy Expenditure) / Fat-Free Mass. Scores above 45 kcal/kg FFM/day support full health; 30-45 is reduced; below 30 indicates clinical LOW EA and RED-S risk requiring medical attention." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "Energy Availability Calculator", item: "https://roadmancycling.com/tools/energy-availability" },
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
              name: "What is energy availability in cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Energy availability (EA) is the amount of dietary energy remaining for normal body functions after accounting for exercise energy expenditure, expressed per kilogram of fat-free mass. It is calculated as (Energy Intake - Exercise Energy Expenditure) / Fat-Free Mass. An EA above 45 kcal/kg FFM/day supports full physiological function, while values below 30 indicate low energy availability and increased risk of Relative Energy Deficiency in Sport (RED-S).",
              },
            },
            {
              "@type": "Question",
              name: "What is RED-S and how does it affect cyclists?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "RED-S (Relative Energy Deficiency in Sport) is a syndrome caused by chronic low energy availability. It impairs metabolic rate, bone health, hormonal function, immune response, cardiovascular health, and psychological wellbeing. In cyclists, RED-S can lead to increased stress fractures, suppressed testosterone or menstrual function, poor recovery, illness susceptibility, and ultimately decreased performance despite increased training.",
              },
            },
            {
              "@type": "Question",
              name: "How many calories should a cyclist eat per day?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Calorie needs vary significantly based on training volume, intensity, body size, and goals. A general guideline is to maintain energy availability above 45 kcal/kg FFM/day. For a 70kg male cyclist with 15% body fat (59.5kg FFM) burning 800 kcal in training, this means eating at least 3,478 kcal per day. On heavy training days, intake should increase to match expenditure rather than creating a large deficit.",
              },
            },
            {
              "@type": "Question",
              name: "What is fat-free mass and how do I measure it?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Fat-free mass (FFM) is your total body weight minus your fat mass. Calculate it as: FFM = body weight x (1 - body fat percentage / 100). For example, a 75kg person with 18% body fat has an FFM of 61.5kg. The most accurate measurement methods are DEXA scan, hydrostatic weighing, or air displacement plethysmography (BodPod). Bioelectrical impedance scales provide a reasonable estimate for tracking trends.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
