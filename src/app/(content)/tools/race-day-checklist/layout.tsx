import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "Race Day Checklist — Everything You Need, Nothing You Forget",
  description:
    "An interactive pre-race checklist that guides you through 48 hours before, night before, and race morning preparation. Check items off, add your own, track progress. Free, no signup.",
  keywords: [
    "race day checklist cycling",
    "pre-race preparation checklist",
    "cycling race preparation",
    "sportive checklist",
    "race morning routine cycling",
    "cycling event preparation",
    "race day preparation guide",
  ],
  alternates: { canonical: "/tools/race-day-checklist" },
  openGraph: {
    title: "Race Day Checklist — Everything You Need, Nothing You Forget",
    description:
      "An interactive pre-race checklist that guides you through 48 hours before, night before, and race morning preparation. Check items off, add your own, track progress. Free, no signup.",
    type: "website",
    url: "https://roadmancycling.com/tools/race-day-checklist",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Race Day Checklist for Cyclists"
        description="Free interactive race day checklist covering 48 hours before, night before, and race morning preparation. Check off items as you go, add your own custom items, and track your completion progress across every phase. Built for road races, sportives, gran fondos, and time trials."
        url="https://roadmancycling.com/tools/race-day-checklist"
        features={[
          "Phased checklist covering 48 hours before, night before, and race morning",
          "Interactive check-off with real-time completion tracking",
          "Add your own custom items to any phase",
          "Equipment, nutrition, logistics, and warm-up categories",
          "Progress bar showing overall and per-phase completion",
          "Works for road races, sportives, gran fondos, and time trials",
          "Printable summary for offline use on race morning",
          "No signup required — use instantly",
        ]}
      />
      <HowToSchema
        name="How to Use the Race Day Checklist"
        description="Prepare for your cycling race or sportive by working through a phased checklist covering 48 hours before, night before, and race morning tasks."
        totalTime="PT2M"
        steps={[
          {
            name: "Work through 48 hours before",
            text: "Start with the 48-hour phase. Check off equipment preparation, bike service, kit layout, and logistics tasks. Add any personal items you need.",
          },
          {
            name: "Complete the night before phase",
            text: "The evening before your race, work through nutrition prep, kit bag packing, device charging, and route review. Tick off each item as you finish it.",
          },
          {
            name: "Run through race morning",
            text: "On race morning, follow the final phase covering breakfast timing, warm-up routine, number collection, and pre-start checks. Nothing gets forgotten.",
          },
          {
            name: "Review your completion",
            text: "Check the progress tracker to confirm every phase is complete. Print or screenshot your checklist if you want a reference at the venue.",
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
              name: "Race Day Checklist",
              item: "https://roadmancycling.com/tools/race-day-checklist",
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
              name: "When should I start preparing for a cycling race?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Start preparation 48 hours before the event. This gives you enough time to service your bike, lay out kit, plan nutrition, and sort logistics without rushing. Leaving everything to race morning is the fastest route to forgetting something critical.",
              },
            },
            {
              "@type": "Question",
              name: "What should I eat the night before a cycling race?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A carbohydrate-rich meal you have eaten before and tolerate well. Rice, pasta, or potatoes with a moderate portion of protein and minimal fibre is the standard approach. The night before is not the time to experiment with new foods or overeat — top up glycogen stores without overloading your gut.",
              },
            },
            {
              "@type": "Question",
              name: "What should I eat on race morning?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eat a familiar, carbohydrate-based breakfast three to four hours before the start. Porridge, toast with jam, or rice cakes are common choices. Keep fat and fibre low to minimise GI issues, and sip water or an electrolyte drink steadily rather than drinking a large volume all at once.",
              },
            },
            {
              "@type": "Question",
              name: "How do I warm up before a cycling race?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Fifteen to twenty minutes on the turbo or a quiet road, building from easy spinning to two or three short efforts at race intensity. The goal is to raise your core temperature and open up your legs, not to fatigue yourself. For longer sportives, a shorter warm-up is fine since the first kilometres serve that purpose.",
              },
            },
            {
              "@type": "Question",
              name: "What equipment do I need for race day?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "At minimum: your bike in working order, helmet, shoes, kit, race number, timing chip if issued, two spare inner tubes, a mini pump or CO2 inflator, tyre levers, and nutrition for the ride. Pin your number the night before and charge your head unit. A checklist removes the guesswork entirely.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
