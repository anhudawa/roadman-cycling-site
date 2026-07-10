import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Training Readiness Check — Should You Train Hard Today?",
  description:
    "An 8-question daily readiness check that tells you whether to train hard, spin easy, or rest. Scored 0–24 with an instant verdict. Free, no signup.",
  keywords: [
    "training readiness check cycling",
    "daily readiness assessment cyclist",
    "should I train today cycling",
    "cycling readiness score",
    "pre-session readiness check",
    "cycling recovery readiness",
    "training readiness questionnaire",
  ],
  alternates: { canonical: "/tools/training-readiness" },
  openGraph: {
    title: "Training Readiness Check — Should You Train Hard Today?",
    description:
      "Eight questions. Under a minute. A clear call on whether to train hard, spin easy, or rest today.",
    type: "website",
    url: "https://roadmancycling.com/tools/training-readiness",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Training Readiness Check for Cyclists"
        description="Free daily readiness check that evaluates sleep, soreness, energy, mood, heart rate, stress, and prior training to tell you whether today should be a hard session, easy spin, or rest day. Eight questions, scored 0–24, with an instant verdict."
        url="https://roadmancycling.com/tools/training-readiness"
        features={[
          "8-question daily readiness assessment",
          "Scored 0–24 with four colour-coded verdict bands",
          "Instant verdict: Rest Day, Easy Only, Moderate, or Green Light",
          "Daily-use design — under 60 seconds to complete",
          "Actionable suggestion for what to do today",
          "Three-day warning for persistent low scores",
          "Links to Recovery Readiness Screen for deeper assessment",
          "No signup required — instant results",
        ]}
      />
      <HowToSchema
        name="How to Use the Training Readiness Check"
        description="Assess your daily training readiness across sleep, soreness, energy, mood, heart rate, stress, and prior training with a scored 8-question check."
        totalTime="PT1M"
        steps={[
          {
            name: "Answer the sleep questions",
            text: "Report how many hours you slept last night and rate your sleep quality. Be honest about last night specifically, not your average.",
          },
          {
            name: "Assess your physical state",
            text: "Rate your current muscle soreness and energy level. These reflect how your body has responded to recent training.",
          },
          {
            name: "Check your mental readiness",
            text: "Rate your mood and motivation for training today, and your current stress level. Mental readiness is as important as physical readiness.",
          },
          {
            name: "Log your resting heart rate and yesterday's session",
            text: "Report where your resting heart rate sits relative to normal, and what you did yesterday. These provide context for your overall readiness.",
          },
          {
            name: "Get your verdict",
            text: "Your total score (0–24) produces one of four verdicts: Rest Day (red), Easy Only (amber), Moderate (green), or Green Light (blue). Follow the suggestion for what to do today.",
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
              name: "Training Readiness Check",
              item: "https://roadmancycling.com/tools/training-readiness",
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
              name: "What is a training readiness check?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A training readiness check is a quick daily self-assessment that evaluates how prepared your body and mind are to train. It looks at sleep, soreness, energy, mood, heart rate, stress, and prior training to produce a score and a clear verdict — train hard, go easy, or rest. It is not a medical diagnostic. It is a structured way to make better daily training decisions.",
              },
            },
            {
              "@type": "Question",
              name: "How is the training readiness score calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eight questions are each scored 0–3, giving a total between 0 and 24. The total determines your verdict: 0–8 Rest Day, 9–14 Easy Only, 15–19 Moderate, 20–24 Green Light. Higher scores mean more readiness signals are favourable.",
              },
            },
            {
              "@type": "Question",
              name: "How often should I use the training readiness check?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Every day before you train. The tool is designed for daily use and takes under a minute. Run it each morning to make a data-informed decision about the day's session rather than relying on how you feel in the first five minutes of a ride.",
              },
            },
            {
              "@type": "Question",
              name: "What should I do if I keep scoring low?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "If you score under 12 for three consecutive days, take the Recovery Readiness Screen for a deeper assessment. Persistent low readiness usually points to accumulated fatigue, poor sleep, or high life stress — and the fix is more rest, not more training.",
              },
            },
            {
              "@type": "Question",
              name: "Is the training readiness check a medical diagnostic?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. This is a self-assessment tool for informational purposes only. It does not diagnose overtraining syndrome, illness, or any medical condition. If you are experiencing persistent fatigue, unexplained performance decline, or concerning symptoms, consult your GP or a sports medicine professional.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
