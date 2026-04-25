import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Heart Rate Zone Calculator $— Free Cycling HR Zones",
  description:
    "Calculate your 5 heart rate training zones from your max HR or LTHR. Free tool for cyclists who train by heart rate.",
  keywords: ["heart rate zone calculator", "cycling HR zones", "heart rate training zones", "max heart rate zones"],
  alternates: { canonical: "https://roadmancycling.com/tools/hr-zones" },
  openGraph: {
    title: "Heart Rate Zone Calculator $— Free Cycling HR Zones",
    description: "Calculate your 5 heart rate training zones from your max HR or LTHR.",
    type: "website",
    url: "https://roadmancycling.com/tools/hr-zones",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Heart Rate Zone Calculator"
        description="Calculate your 5 cycling heart rate training zones from your maximum heart rate or lactate threshold heart rate."
        url="https://roadmancycling.com/tools/hr-zones"
        features={[
          "5-zone heart rate model",
          "Calculate from max HR or LTHR",
          "Training recommendations per zone",
          "Copy-to-clipboard results",
        ]}
      />
      <HowToSchema
        name="How to Calculate Heart Rate Training Zones"
        description="Calculate your 5 cycling heart rate training zones from your maximum heart rate or lactate threshold heart rate."
        totalTime="PT2M"
        steps={[
          { name: "Determine your max HR or LTHR", text: "Use a field test (max HR: hardest effort for 3-5 minutes uphill) or lab test. LTHR: average HR from a 30-minute all-out effort." },
          { name: "Enter your heart rate", text: "Input your max HR (typically 180-200 for adults) or LTHR (typically 160-180 for trained cyclists)." },
          { name: "Review your 5 zones", text: "The calculator outputs Zone 1 (Recovery) through Zone 5 (VO2max) with HR ranges for each." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "HR Zone Calculator", item: "https://roadmancycling.com/tools/hr-zones" },
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
              name: "How do I find my maximum heart rate?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The most reliable method is a field test: warm up for 15 minutes, then ride as hard as you can up a steep hill for 3-5 minutes. Your peak HR in the final minute is close to your max. The 220-minus-age formula is a rough estimate but can be off by 10-15 bpm for individuals.",
              },
            },
            {
              "@type": "Question",
              name: "What is LTHR in cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Lactate Threshold Heart Rate (LTHR) is your average heart rate during a 30-minute all-out effort. It corresponds roughly to the top of Zone 4 and the intensity you can sustain for about an hour. LTHR is more useful than max HR for zone calculation because it reflects fitness, not just genetics.",
              },
            },
            {
              "@type": "Question",
              name: "Should I train by heart rate or power?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Power is more precise and instant, but heart rate is cheaper and still useful $— especially for pacing easy rides and detecting fatigue. Many coaches recommend using both: power for interval targets, heart rate for Zone 2 rides and recovery monitoring.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
