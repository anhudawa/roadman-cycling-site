import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Masters FTP Benchmark Calculator (40-44, 45-49, 50-54, 55-59, 60+)",
  description:
    "Free FTP benchmark calculator for masters cyclists. Enter age, FTP, and weight to see your percentile ranking among trained amateur masters cyclists in your age group — 40-44, 45-49, 50-54, 55-59, 60+.",
  keywords: [
    "masters ftp benchmark",
    "ftp by age group",
    "cycling ftp percentile masters",
    "masters cyclist w/kg",
    "amateur cycling benchmarks",
    "ftp 40 45 50 55 60",
  ],
  alternates: { canonical: "https://roadmancycling.com/tools/masters-ftp-benchmark" },
  openGraph: {
    title: "Masters FTP Benchmark Calculator (40-44, 45-49, 50-54, 55-59, 60+)",
    description:
      "Free FTP benchmark calculator for masters cyclists. Enter age, FTP, and weight to see your percentile ranking among trained amateur masters cyclists in your age group.",
    type: "website",
    url: "https://roadmancycling.com/tools/masters-ftp-benchmark",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Masters FTP Benchmark Calculator"
        description="Free browser-based FTP benchmark for masters cyclists. Calculates W/kg and percentile ranking among trained amateur masters cyclists by age group and gender."
        url="https://roadmancycling.com/tools/masters-ftp-benchmark"
        features={[
          "Percentile ranking by five-year age group (40-44, 45-49, 50-54, 55-59, 60+)",
          "Gender-specific cohort distribution",
          "Group median and 90th-percentile reference values",
          "Watts to next anchor band — concrete next-target number",
          "Built specifically for masters cyclists",
        ]}
      />
      <HowToSchema
        name="How to Calculate Your Masters FTP Benchmark"
        description="See where your FTP sits among trained amateur masters cyclists in your age group by entering age, gender, FTP, and body weight."
        totalTime="PT1M"
        steps={[
          {
            name: "Confirm a recent FTP",
            text: "FTP should be from a 20-minute all-out test (×0.95) or ramp test in the last three months. Estimated or stale FTP makes the percentile result unreliable.",
          },
          {
            name: "Enter age, gender, FTP, and weight",
            text: "Age determines the cohort (40-44, 45-49, 50-54, 55-59, 60+). Weight should be measured consistently (morning, before eating).",
          },
          {
            name: "Read the percentile and W/kg result",
            text: "The result shows your W/kg, your percentile in your age and gender cohort, the cohort median and 90th-percentile reference values, and the watts you would need to add to reach the next anchor band.",
          },
          {
            name: "Use the interpretation to choose your next training focus",
            text: "Each band has a calibrated interpretation explaining the most common unlocks at that level — whether that is intensity discipline, strength training, base volume, or recovery work.",
          },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            {
              "@type": "ListItem",
              position: 3,
              name: "Masters FTP Benchmark",
              item: "https://roadmancycling.com/tools/masters-ftp-benchmark",
            },
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
              name: "What is a good FTP for a masters cyclist?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A 'good' FTP for a masters cyclist depends on age, gender, and weight. As a rough guide for trained amateur male masters cyclists, the median W/kg is approximately 3.1 at 40-44, 3.0 at 45-49, 2.8 at 50-54, 2.6 at 55-59, and 2.4 at 60+. For trained female masters cyclists the medians are roughly 0.5 W/kg lower in each band. Crossing 3.0 W/kg in the 50+ cohort puts a rider in the upper third of the trained amateur pool.",
              },
            },
            {
              "@type": "Question",
              name: "Why use age-graded FTP percentiles instead of a single benchmark?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Power-to-weight declines roughly 1% per year from age 30 if untrained, and even consistently trained masters cyclists lose some absolute output as they age. A flat W/kg ranking that puts every rider on the same scale unfairly penalises older riders against riders in their 20s. Age-graded percentiles compare you against trained amateur cyclists in your own decade, which is the comparison that actually tells you how well your training is working.",
              },
            },
            {
              "@type": "Question",
              name: "How accurate are the percentile bands?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The bands are heuristic distributions built from Coggan power profile data adjusted for amateur (non-professional) populations and the masters decline observed across published age-graded results. They are directional, not federation-grade. The goal is to give masters riders a fair sense of where they sit among trained peers, not to rank for licensing categories. Treat the result as a useful estimate, not a definitive number.",
              },
            },
            {
              "@type": "Question",
              name: "What W/kg do you need to win a masters race?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on the level. Local masters races are typically won at 3.5–4.0 W/kg in the 40-49 bands and 3.2–3.7 W/kg in the 50-59 bands. National-level masters racing typically requires 4.0+ W/kg in the 40s and 3.6+ in the 50s. Power numbers don't capture skills, race-craft, or repeated-effort capacity though — riders below these numbers regularly win races by riding smarter than stronger competitors.",
              },
            },
            {
              "@type": "Question",
              name: "Should masters cyclists test FTP differently?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The protocols are the same — 20-minute test (×0.95) or ramp test — but masters cyclists should pay closer attention to recovery before testing. A poor night's sleep or a stressful work week can cost 10–15 watts on test day, which over-estimates training fatigue and under-estimates fitness. Test on a fully fresh day, in a familiar environment, and re-test no more than every 8–12 weeks.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
