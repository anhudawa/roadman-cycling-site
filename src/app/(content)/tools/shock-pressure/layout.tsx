import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Shock Pressure Calculator — Suspension Setup",
  description:
    "Free MTB suspension calculator. Get recommended shock pressure, fork PSI, and sag percentage for your weight and riding style — XC, trail, enduro, or DH.",
  keywords: ["shock pressure calculator", "suspension setup calculator", "mountain bike sag calculator", "fork pressure calculator"],
  alternates: { canonical: "https://roadmancycling.com/tools/shock-pressure" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Set Up MTB Suspension and Tyre Pressure"
        description="Calculate the recommended air pressure for your rear shock, front fork, and mountain bike tyres based on rider weight, bike weight, riding style, and tyre setup."
        totalTime="PT5M"
        steps={[
          { name: "Enter rider and bike weight", text: "Input your rider weight in kilograms (including riding gear, add 3-5kg to body weight) and your bike weight. These are the primary variables for both suspension and tyre pressure." },
          { name: "Select your riding style", text: "Choose between cross-country, trail, enduro, or downhill. Each style uses different sag targets and pressure ranges — XC runs firmer for pedalling efficiency, while DH runs softer for maximum plushness." },
          { name: "Configure tyre settings", text: "Select your tyre width in inches and tyre setup (tubeless or tubed). Tubeless allows lower pressures without pinch flat risk. The calculator uses lookup tables calibrated against Bike Faff, CushCore, and Enve reference data." },
          { name: "Set up and verify sag", text: "Use the recommended pressures as starting points. Set your shock and fork pressure, then measure sag with a friend holding you upright in riding position. Adjust in 5 PSI increments until you hit the target sag percentage." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "MTB Setup Calculator", item: "https://roadmancycling.com/tools/shock-pressure" },
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
              name: "What pressure should my mountain bike shock be?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Shock pressure depends on your rider weight, shock model, and riding style. As a starting point, most air shocks use a pressure roughly equal to your body weight in pounds plus 30-50 PSI. For example, a 75kg (165lb) rider on a Fox DPX2 would start around 195-215 PSI. The goal is to achieve 25-30% sag for trail and enduro riding, or 20-25% for cross-country. Always verify with a sag measurement rather than relying on pressure alone.",
              },
            },
            {
              "@type": "Question",
              name: "How do I measure sag on my mountain bike?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Push the rubber o-ring on your shock stanchion down to the seal, then carefully sit on the bike in your normal riding position with all your gear on. Have a friend hold you steady. Dismount without bouncing and measure how far the o-ring has moved relative to the total shock stroke. Divide that distance by the total stroke and multiply by 100 to get your sag percentage. For trail riding, aim for 25-30% sag on the rear shock and 20-25% on the fork.",
              },
            },
            {
              "@type": "Question",
              name: "What is the difference between XC and enduro suspension setup?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Cross-country (XC) setups run firmer with 20-25% sag to maximise pedalling efficiency and reduce energy loss through suspension bob. Enduro and downhill setups run softer at 28-35% sag to absorb bigger hits, improve traction on rough terrain, and keep the tyre in contact with the ground. The trade-off is that softer suspension feels less efficient when pedalling on smooth climbs, which is why many enduro bikes use a lockout or climb switch.",
              },
            },
            {
              "@type": "Question",
              name: "What PSI should my mountain bike fork be?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Fork pressure is typically lower than rear shock pressure because the fork carries less of your body weight — roughly 40% versus 60% on the rear. A 75kg rider on a Fox 36 might run 70-80 PSI in the fork compared to 195-215 PSI in the rear shock. Start with the manufacturer's recommended pressure for your weight, set the sag to 20-25% for XC or 25-30% for trail and enduro, then fine-tune rebound and compression from there.",
              },
            },
            {
              "@type": "Question",
              name: "What tyre pressure should I run on my mountain bike?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mountain bike tyre pressure varies by tyre width, rider weight, terrain, and whether you run tubeless. A typical trail rider (75kg) on 2.4-inch tubeless tyres would run 22-26 PSI rear and 20-24 PSI front. Heavier riders add 1-2 PSI per 5kg above 75kg. Running tubeless allows 3-5 PSI lower than tubed setups without pinch flat risk. Too high and you lose grip; too low and you risk rim strikes and a vague, wallowing feel in corners.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
