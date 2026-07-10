import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Recovery Readiness Screen — Is Your Recovery Keeping Pace?",
  description:
    "A 10-question self-assessment that evaluates your sleep, training load, nutrition, and stress. Scored 0–30 with personalised recommendations. Free, no signup.",
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
    title: "Recovery Readiness Screen — Is Your Recovery Keeping Pace?",
    description:
      "Ten questions across sleep, training load, nutrition, and stress. A scored self-assessment with actionable recommendations for cyclists.",
    type: "website",
    url: "https://roadmancycling.com/tools/recovery-screen",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Recovery Readiness Screen for Cyclists"
        description="Free self-assessment tool that screens your recovery practices across sleep, training load, nutrition, and stress. Ten questions, scored 0–30, with personalised recommendations based on your weakest areas."
        url="https://roadmancycling.com/tools/recovery-screen"
        features={[
          "10-question self-assessment across four recovery categories",
          "Scored 0–30 with four colour-coded severity bands",
          "Category breakdown: Sleep, Training Load, Nutrition, Stress & Wellbeing",
          "Top 3 personalised recommendations based on lowest-scoring areas",
          "Links to related recovery and training tools",
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
            text: "Report your weekly training frequency and number of complete rest days. These form the Training Load category (max 6 points). Count all structured training — bike, strength, and any deliberate cardio.",
          },
          {
            name: "Answer the nutrition question",
            text: "Rate how quickly you eat after hard sessions. This single question forms the Nutrition category (max 3 points). Post-ride fuelling is the recovery lever most riders underestimate.",
          },
          {
            name: "Answer the stress and wellbeing questions",
            text: "Rate your life stress, heart rate tracking habits, morning fatigue, performance trend, and training motivation. These five questions form the Stress and Wellbeing category (max 15 points).",
          },
          {
            name: "Review your results and recommendations",
            text: "Your total score (0–30) places you in one of four bands: Recovery Deficit (red), Recovery Gaps (amber), Reasonable Recovery (green), or Strong Recovery (blue). Read the top three personalised recommendations and act on the most accessible one first.",
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
                text: "A recovery readiness screen is a self-assessment that evaluates how well your body is recovering from training. It looks at sleep, training load, nutrition timing, stress, and wellbeing markers to produce a score and actionable recommendations. It is not a medical diagnostic — it is a structured way to identify recovery gaps before they become overtraining problems.",
              },
            },
            {
              "@type": "Question",
              name: "How is the recovery readiness score calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ten questions are each scored 0–3, giving a total between 0 and 30. Questions are grouped into four categories: Sleep (max 6), Training Load (max 6), Nutrition (max 3), and Stress and Wellbeing (max 15). The total determines your band: 0–10 Recovery Deficit, 11–18 Recovery Gaps, 19–24 Reasonable Recovery, 25–30 Strong Recovery.",
              },
            },
            {
              "@type": "Question",
              name: "What should I do if my recovery score is low?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Start with the personalised recommendations the tool provides — they target your three weakest areas. The most common fixes are increasing sleep duration, adding a rest day, and eating sooner after hard sessions. If your score is in the Recovery Deficit band (0–10), consider a structured recovery week at 40–50% of normal training volume before resuming your plan.",
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
