import type { Metadata } from "next";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Age Grade Calculator | Roadman Cycling",
  description:
    "Age-grade your cycling power to see how your FTP compares to your peak potential. Percentile rankings for trained masters cyclists by age and gender.",
  keywords: [
    "cycling age grade calculator",
    "age graded cycling power",
    "masters cyclist ftp comparison",
    "cycling performance by age",
    "age adjusted w/kg",
    "peak equivalent power cycling",
  ],
  alternates: { canonical: "/tools/age-grade" },
  openGraph: {
    title: "Cycling Age Grade Calculator | Roadman Cycling",
    description:
      "Age-grade your cycling power to see how your FTP compares to your peak potential. Percentile rankings for trained masters cyclists by age and gender.",
    type: "website",
    url: "https://roadmancycling.com/tools/age-grade",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="age-grade" />
      <SoftwareApplicationSchema
        name="Cycling Age Grade Calculator"
        description="Free browser-based age-grading calculator for cyclists. Compare your current FTP to your peak potential, see where you rank among trained masters cyclists in your age group, and find out how much performance structured training preserves."
        url="https://roadmancycling.com/tools/age-grade"
        features={[
          "Age-graded W/kg adjusted for age-related decline",
          "Peak-equivalent power — what your current output would equal at peak age",
          "Percentile ranking among trained masters cyclists by age and gender",
          "Decade-by-decade comparison table from age 25 to 65",
          "Research-backed age-decline model (trained vs sedentary curves)",
        ]}
      />
      <HowToSchema
        name="How to Age-Grade Your Cycling Power"
        description="Compare your FTP against your peak potential and see where you rank among trained masters cyclists in your age group."
        totalTime="PT2M"
        steps={[
          {
            name: "Enter your current details",
            text: "Enter your age, gender, FTP in watts, and body weight in kilograms. FTP should be from a recent test — within the last three months.",
          },
          {
            name: "Read your age-graded result",
            text: "The calculator shows your age factor (percentage of peak performance expected at your age), your peak-equivalent W/kg, and your percentile among trained masters cyclists in your decade.",
          },
          {
            name: "Review the decade comparison",
            text: "The decade table shows expected W/kg at every five-year mark from 25 to 65, assuming the same relative fitness level. This puts your current number in context across a full career arc.",
          },
          {
            name: "Use the result to set training targets",
            text: "The age factor tells you how much room structured training can create. Masters cyclists who train consistently show roughly half the decline of sedentary peers — that gap is your opportunity.",
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
              name: "Age Grade Calculator",
              item: "https://roadmancycling.com/tools/age-grade",
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
              name: "What is age-graded cycling power?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Age-graded cycling power adjusts your current FTP for the expected physiological decline that comes with ageing. It answers: 'If I produced this power at my peak age (25-35), what would the equivalent be?' A 52-year-old holding 3.2 W/kg might have a peak-equivalent of 3.8 W/kg — meaning their current fitness, adjusted for age, is comparable to a younger rider at that level.",
              },
            },
            {
              "@type": "Question",
              name: "How fast does cycling power decline with age?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For trained cyclists, power output declines roughly 0.5-1% per year from age 35 to 50, accelerating slightly after 50. Sedentary individuals lose about twice as much — roughly 10% per decade compared to 5% for trained athletes. VO2max, the engine behind sustained power, drops 7-10% per decade after 30 in the general population but only about 5% per decade in masters athletes who maintain structured training.",
              },
            },
            {
              "@type": "Question",
              name: "Can training offset age-related decline in cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, significantly. Research consistently shows that structured training can halve the rate of age-related performance decline. A well-trained 55-year-old can maintain power output that a sedentary person would have lost 10-15 years earlier. Polarised intensity distribution, targeted strength work, and recovery discipline are the biggest levers for masters cyclists.",
              },
            },
            {
              "@type": "Question",
              name: "What is a good W/kg for a 50-year-old cyclist?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For trained amateur male cyclists aged 50-54, the median W/kg is approximately 2.6-2.8, with the 90th percentile around 3.5 W/kg. For trained female cyclists in the same age group, subtract roughly 0.5-0.6 W/kg. Holding 3.0+ W/kg at 50 puts a male rider well above the median of the trained amateur pool.",
              },
            },
          ],
        }}
      />
      {children}
      <ToolJourney slug="age-grade" />
    </>
  );
}
