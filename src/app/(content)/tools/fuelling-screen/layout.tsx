import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Fuelling Self-Assessment — Is Your Nutrition Holding You Back?",
  description:
    "A 10-question self-assessment that evaluates your cycling nutrition across pre-ride fuelling, in-ride carbs, recovery nutrition, hydration, and race-day planning. Scored 0–30 with personalised recommendations. Free, no signup.",
  keywords: [
    "cycling nutrition assessment",
    "fuelling self-assessment",
    "cycling nutrition screening tool",
    "cyclist nutrition checklist",
    "race nutrition diagnostic",
    "cycling fuelling calculator",
    "cycling diet assessment",
  ],
  alternates: { canonical: "/tools/fuelling-screen" },
  openGraph: {
    title: "Fuelling Self-Assessment — Is Your Nutrition Holding You Back?",
    description:
      "Ten questions across pre-ride fuelling, in-ride carbs, recovery nutrition, and race-day planning. A scored self-assessment with actionable recommendations for cyclists.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling-screen",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Fuelling Self-Assessment for Cyclists"
        description="Free self-assessment tool that screens your cycling nutrition practices across pre-ride fuelling, in-ride carbs, recovery nutrition, hydration, and race-day planning. Ten questions, scored 0–30, with personalised recommendations based on your weakest areas."
        url="https://roadmancycling.com/tools/fuelling-screen"
        features={[
          "10-question self-assessment across three nutrition categories",
          "Scored 0–30 with four colour-coded severity bands",
          "Category breakdown: Pre/During/Post Ride, Daily Nutrition, Race Preparation",
          "Top 3 personalised recommendations based on lowest-scoring areas",
          "Links to related fuelling and nutrition tools",
          "No signup required — instant results",
        ]}
      />
      <HowToSchema
        name="How to Use the Fuelling Self-Assessment"
        description="Assess your cycling nutrition practices across pre-ride fuelling, in-ride carbs, recovery nutrition, hydration, and race-day planning with a scored 10-question screening tool."
        totalTime="PT2M"
        steps={[
          {
            name: "Answer the ride fuelling questions",
            text: "Rate your pre-ride eating, in-ride carb intake, gut training practice, and post-ride recovery nutrition. These four questions form the Pre/During/Post Ride category (max 12 points). Be honest about your typical behaviour, not your best day.",
          },
          {
            name: "Answer the daily nutrition questions",
            text: "Rate your daily protein intake, hydration strategy, energy availability, and supplement practices. These four questions form the Daily Nutrition category (max 12 points). Think about your consistent habits over the last month.",
          },
          {
            name: "Answer the race preparation questions",
            text: "Rate your race nutrition planning and caffeine strategy. These two questions form the Race Preparation category (max 6 points). Consider your most recent event or target race.",
          },
          {
            name: "Review your results and recommendations",
            text: "Your total score (0–30) places you in one of four bands: Major Fuelling Gaps (red), Some Gaps to Address (amber), Solid Foundation (green), or Race-Ready Fuelling (blue). Read the top three personalised recommendations and act on the most accessible one first.",
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
              name: "Fuelling Self-Assessment",
              item: "https://roadmancycling.com/tools/fuelling-screen",
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
              name: "What is a fuelling self-assessment for cyclists?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A fuelling self-assessment is a structured screening tool that evaluates your cycling nutrition practices across ten areas: pre-ride fuelling, in-ride carbohydrate intake, gut training, recovery nutrition, daily protein, hydration, race nutrition planning, energy availability, caffeine strategy, and supplement basics. It produces a score and actionable recommendations. It is not medical or dietary advice — it is a structured way to identify nutrition gaps that may be limiting your performance.",
              },
            },
            {
              "@type": "Question",
              name: "How is the fuelling assessment score calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ten questions are each scored 0–3, giving a total between 0 and 30. Questions are grouped into three categories: Pre/During/Post Ride (max 12), Daily Nutrition (max 12), and Race Preparation (max 6). The total determines your band: 0–10 Major Fuelling Gaps, 11–18 Some Gaps to Address, 19–24 Solid Foundation, 25–30 Race-Ready Fuelling.",
              },
            },
            {
              "@type": "Question",
              name: "How many grams of carbs per hour should I eat while cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For rides over 90 minutes, current evidence supports 60–90 grams of carbohydrates per hour using a mix of glucose and fructose (typically in a 2:1 ratio). Start at the lower end and build up over several weeks of gut training. For rides under 90 minutes at moderate intensity, in-ride fuelling is less critical provided pre-ride nutrition is adequate.",
              },
            },
            {
              "@type": "Question",
              name: "What should I eat before a bike ride?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eat a carbohydrate-rich meal 2–3 hours before riding, aiming for 1–4 grams of carbs per kilogram of body weight. Practical options include porridge with banana, toast with eggs, or rice with a protein source. Avoid high-fat and high-fibre foods close to the ride as they slow gastric emptying and can cause discomfort at intensity.",
              },
            },
            {
              "@type": "Question",
              name: "Is this fuelling assessment medical or dietary advice?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. This is a self-assessment tool for informational purposes only. It does not constitute medical or dietary advice and does not replace consultation with a registered dietitian, sports nutritionist, or your GP. If you have a diagnosed eating disorder, suspected RED-S, or any medical condition affecting nutrition, seek professional guidance.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
