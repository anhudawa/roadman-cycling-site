import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Masters Recovery Score — Cycling Recovery Calculator (40+)",
  description:
    "Free recovery calculator for masters cyclists. Combines age, training load, sleep, and life stress into a 0–100 score with a recovery recommendation calibrated to riders over 40.",
  keywords: [
    "masters recovery score",
    "cycling recovery calculator",
    "masters cyclist recovery",
    "recovery for cyclists over 40",
    "cycling overtraining risk",
    "training load masters cyclists",
  ],
  alternates: { canonical: "https://roadmancycling.com/tools/masters-recovery-score" },
  openGraph: {
    title: "Masters Recovery Score — Cycling Recovery Calculator (40+)",
    description:
      "Free recovery calculator for masters cyclists. Combines age, training load, sleep, and life stress into a 0–100 score with a recovery recommendation calibrated to riders over 40.",
    type: "website",
    url: "https://roadmancycling.com/tools/masters-recovery-score",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Masters Cycling Recovery Score Calculator"
        description="Free browser-based recovery calculator for masters cyclists. Combines age, training load, sleep quality, and life stress into a 0–100 recovery score with a calibrated recommendation."
        url="https://roadmancycling.com/tools/masters-recovery-score"
        features={[
          "Age-adjusted sustainable training load model",
          "0–100 recovery score with severity bands",
          "Top fixable lever surfaced (sleep, stress, or load)",
          "Banded recommendations from optimal to critical",
          "Built specifically for cyclists 40+",
        ]}
      />
      <HowToSchema
        name="How to Calculate Your Masters Recovery Score"
        description="Estimate your weekly recovery capacity as a masters cyclist by combining age, training hours, sleep quality, and stress into a single recovery score."
        totalTime="PT2M"
        steps={[
          {
            name: "Enter your age and weekly training hours",
            text: "Age sets the sustainable load baseline. Weekly hours include all structured training — bike, strength, and any other deliberate cardio. Be honest; the score is only useful if the inputs are.",
          },
          {
            name: "Rate sleep quality across the last seven nights",
            text: "Pick the band that best describes your average sleep over the last week, including both duration and how restored you feel waking up. One bad night isn't the score; the seven-night pattern is.",
          },
          {
            name: "Rate life stress across the last seven days",
            text: "Stress and training load are additive — the body recovers from total stress, not just bike stress. Consider work pressure, family load, and any major life events.",
          },
          {
            name: "Read the recovery score and the top fixable lever",
            text: "The 0–100 score lands you in one of five bands from optimal to critical. The recommendation is calibrated to that band. The top lever surfaces the single biggest variable you can change in the next seven days.",
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
              name: "Masters Recovery Score",
              item: "https://roadmancycling.com/tools/masters-recovery-score",
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
              name: "Why do masters cyclists need a different recovery score?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Recovery capacity declines after 40 and the same training load that worked at 30 produces more residual fatigue at 50. Generic readiness scores don't account for age-adjusted sustainable training load. The masters recovery score combines age, weekly training hours, sleep quality, and life stress so the read is calibrated for riders 40+ rather than for trained 25-year-olds.",
              },
            },
            {
              "@type": "Question",
              name: "What is the sustainable training load for a masters cyclist?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The sustainable weekly load model used here declines from approximately 14 hours per week at age 40 to around 9 hours per week at 65+, consistent with the periodisation prescriptions in Joe Friel's masters work and the coaching practice across the Roadman archive. Riding above your sustainable load isn't automatically wrong but it raises the recovery cost — the score reflects that.",
              },
            },
            {
              "@type": "Question",
              name: "How accurate is a recovery score based on four inputs?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It is a directional self-audit, not a clinical readiness measure. The score will not catch every overtraining case and won't replace HRV trends or resting heart rate data. What it does well is highlight the single biggest fixable lever in a given week — usually sleep — and surface the riders who are training above their sustainable load without realising it.",
              },
            },
            {
              "@type": "Question",
              name: "What sleep quality counts as 'good' for a masters cyclist?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For masters cyclists training hard, the realistic target is 7.5–9 hours per night with consistent wake times. 'Good' on the score corresponds to roughly 7–8 hours of unbroken sleep on most nights of the last week. Below 7 hours two nights running is the threshold at which most coaches recommend dropping the next hard session rather than pushing through.",
              },
            },
            {
              "@type": "Question",
              name: "Should I do a hard ride if my recovery score is low?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "If the score is in the compromised band or lower (under 60), the default is no — drop or convert one hard session this week. The masters cyclists who keep gaining over years are the ones who back off when recovery is the bottleneck, not the ones who train through fatigue. Hard sessions executed on a low-recovery body are a low-quality stimulus and a high-risk one.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
