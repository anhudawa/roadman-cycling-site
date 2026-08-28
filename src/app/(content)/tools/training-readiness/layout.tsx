import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Training Readiness Check for Cyclists",
  description:
    "Organise eight daily cycling-readiness signals before training. A free 0–24 context check with clear evidence limits and no signup.",
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
    title: "Training Readiness Check for Cyclists",
    description:
      "Eight questions. Under a minute. Organise sleep, soreness, energy, stress and recent-load signals before the planned session.",
    type: "website",
    url: "https://roadmancycling.com/tools/training-readiness",
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
        name="Training Readiness Check for Cyclists"
        description="Free daily context check that organises sleep, soreness, energy, mood, heart rate, stress and prior-training signals. Eight questions produce a 0–24 heuristic band with explicit evidence limits."
        url="https://roadmancycling.com/tools/training-readiness"
        features={[
          "8-question daily readiness assessment",
          "Scored 0–24 with four colour-coded context bands",
          "Conservative starting guidance that cannot add training load",
          "Daily-use design — under 60 seconds to complete",
          "Clear warning that the cut-offs are not clinically validated",
          "Pattern warning for repeated unfavourable signals",
          "Links to Recovery Readiness Screen for deeper assessment",
          "Early-access path to Roadman's strength and recovery app",
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
            name: "Read the context band",
            text: "Your total score (0–24) produces one of four context bands. Use it alongside symptoms, your own baseline, the planned session and the warm-up response; it is not a validated diagnosis or automatic training instruction.",
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
                text: "A training readiness check is a quick daily self-assessment that organises sleep, soreness, energy, mood, heart rate, stress and prior-training context. This tool produces a heuristic band rather than a diagnosis or universal train-versus-rest instruction.",
              },
            },
            {
              "@type": "Question",
              name: "How is the training readiness score calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eight questions are each scored 0–3, giving a total between 0 and 24. The four bands organise how many self-reported signals are favourable. The thresholds are a Roadman coaching heuristic, not clinically validated cut-offs.",
              },
            },
            {
              "@type": "Question",
              name: "How often should I use the training readiness check?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Use it consistently when a daily trend would help, ideally under similar conditions. Compare the pattern with your own baseline, symptoms, planned session and warm-up response rather than letting one score make the decision.",
              },
            },
            {
              "@type": "Question",
              name: "What should I do if I keep scoring low?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Review which signals are repeatedly unfavourable and use the Recovery Readiness Screen to organise the wider context. Persistent fatigue or performance decline can have several causes; concerning symptoms, illness or an unexplained persistent change belong with a qualified healthcare professional.",
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
