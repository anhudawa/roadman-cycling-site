import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Cycling Recovery Readiness Screen",
  description:
    "Organise ten cycling-recovery signals across sleep, recent load, fuelling, stress and wellbeing. Free 0–30 context screen with clear evidence limits.",
  keywords: [
    "cycling recovery screen",
    "recovery readiness assessment",
    "cycling recovery self-assessment",
    "overtraining screening tool",
    "cyclist recovery checklist",
    "training recovery diagnostic",
    "cycling fatigue assessment",
  ],
  alternates: { canonical: "/tools/recovery-screen" },
  openGraph: {
    title: "Cycling Recovery Readiness Screen",
    description:
      "Ten questions across sleep, recent load, fuelling, stress and wellbeing, with practical priorities and explicit evidence boundaries.",
    type: "website",
    url: "https://roadmancycling.com/tools/recovery-screen",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Recovery Readiness Screen for Cyclists"
        description="Free self-assessment that organises sleep, recent-load, fuelling, stress and wellbeing signals. Ten questions produce a 0–30 heuristic band and three priorities to review."
        url="https://roadmancycling.com/tools/recovery-screen"
        features={[
          "10-question self-assessment across four recovery categories",
          "Scored 0–30 with four colour-coded context bands",
          "Category breakdown: Sleep, Load & Recovery, Fuelling, Stress & Response",
          "Top 3 priorities based on lowest-scoring areas",
          "Explicit warning that the cut-offs are not clinically validated",
          "Links to related recovery and training tools",
          "Early-access path to Roadman's strength and recovery app",
          "No signup required — instant results",
        ]}
      />
      <HowToSchema
        name="How to Use the Recovery Readiness Screen"
        description="Assess your recovery practices across sleep, training load, nutrition, and stress with a scored 10-question screening tool."
        totalTime="PT2M"
        steps={[
          {
            name: "Answer the sleep questions",
            text: "Rate your typical sleep duration and sleep quality. These two questions form the Sleep category (max 6 points). Be honest about your last seven days rather than your best case.",
          },
          {
            name: "Answer the training load questions",
            text: "Compare recent bike, strength and life load with your own baseline, then assess whether easier days have matched the demanding work. These form the Load and Recovery category (max 6 points).",
          },
          {
            name: "Answer the nutrition question",
            text: "Rate how consistently you replace fuel and fluid after demanding sessions, particularly when another session follows soon. This forms the Fuelling category (max 3 points).",
          },
          {
            name: "Answer the stress and wellbeing questions",
            text: "Rate your life stress, heart rate tracking habits, morning fatigue, performance trend, and training motivation. These five questions form the Stress and Wellbeing category (max 15 points).",
          },
          {
            name: "Review your results and recommendations",
            text: "Your total score (0–30) places the current answers in one of four context bands and identifies three priorities to review. The result is a Roadman heuristic, not a diagnosis, validated cut-off or automatic training prescription.",
          },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Tools",
              item: "https://roadmancycling.com/tools",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Recovery Readiness Screen",
              item: "https://roadmancycling.com/tools/recovery-screen",
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
              name: "What is a recovery readiness screen?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A recovery readiness screen is a self-assessment that organises sleep, recent load, fuelling, stress and wellbeing signals. It can identify topics to review, but it does not measure recovery directly or diagnose under-recovery, overtraining syndrome, REDs or illness.",
              },
            },
            {
              "@type": "Question",
              name: "How is the recovery readiness score calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ten questions are each scored 0–3, giving a total between 0 and 30. Questions are grouped into Sleep, Load and Recovery, Fuelling, and Stress and Response. The four bands are Roadman context heuristics rather than clinically validated thresholds.",
              },
            },
            {
              "@type": "Question",
              name: "What should I do if my recovery score is low?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Review the three lowest-scoring areas in the context of your normal baseline, recent workload, symptoms and next important session. Do not apply a fixed rest-day count or percentage reduction from this score alone. Persistent fatigue, unexplained decline or concerning symptoms belong with a qualified healthcare professional.",
              },
            },
            {
              "@type": "Question",
              name: "How often should I take the recovery readiness screen?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Once a week is practical — ideally on the same day each week so you can spot trends. It is particularly useful at the start of a training block, after a heavy week, or when you notice signs of accumulated fatigue such as low motivation, poor sleep, or stalling performance.",
              },
            },
            {
              "@type": "Question",
              name: "Is this recovery screen a medical diagnostic?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. This is a self-assessment tool for informational purposes only. It does not diagnose overtraining syndrome, relative energy deficiency, or any medical condition. If you are experiencing persistent fatigue, unexplained performance decline, or concerning symptoms, consult your GP or a sports medicine professional.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
