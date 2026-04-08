import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Tyre Pressure Calculator — Optimal PSI for Cycling",
  description:
    "Calculate optimal front and rear tyre pressure based on rider weight, tyre width, road surface, and conditions. Free cycling tool from Roadman Cycling.",
  keywords: ["tyre pressure calculator cycling", "bike tyre pressure", "cycling PSI calculator", "optimal tyre pressure"],
  alternates: { canonical: "https://roadmancycling.com/tools/tyre-pressure" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Calculate Tyre Pressure"
        description="Calculate the optimal front and rear tyre pressure for your road bike based on rider weight, tyre width, rim width, tyre setup, and road surface."
        totalTime="PT2M"
        steps={[
          { name: "Enter your weight", text: "Enter your rider weight in kilograms and your bike weight. The calculator uses a 40/60 front/rear weight distribution model." },
          { name: "Select tyre and rim dimensions", text: "Choose your tyre width (23-45mm) and rim internal width (15-30mm). Wider rims spread the tyre casing, reducing the pressure needed." },
          { name: "Choose tyre setup and surface", text: "Select your tyre type (clincher, tubeless, or tubular) and road surface (smooth, rough, or gravel). Tubeless runs ~9% lower; rough surfaces need lower pressure for grip." },
          { name: "Review your recommended pressures", text: "The calculator outputs separate front and rear PSI values using the 15% tyre deflection model based on Frank Berto's research. Fine-tune by 2-3 PSI based on feel." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "Tyre Pressure Calculator", item: "https://roadmancycling.com/tools/tyre-pressure" },
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
              name: "What tyre pressure should I run on my road bike?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Optimal road bike tyre pressure depends on rider weight, tyre width, rim width, and road surface. A 75kg rider on 25mm clinchers typically runs 85-90 PSI rear and 80-85 PSI front. Wider tyres run lower — 28mm around 70-75 PSI, 32mm around 55-60 PSI. The days of pumping tyres to 120 PSI are over. Research by Frank Berto and SILCA shows that lower pressures within the correct range reduce rolling resistance on real roads by absorbing vibration rather than bouncing over imperfections.",
              },
            },
            {
              "@type": "Question",
              name: "Should front and rear tyre pressure be different?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Your rear tyre carries more weight than the front — roughly 55% of total system weight versus 45% on a road bike. The rear should run 5-10 PSI higher than the front. Running equal pressure front and rear means your front tyre is over-inflated, reducing grip and comfort. This front/rear split is one of the simplest free speed gains you can make.",
              },
            },
            {
              "@type": "Question",
              name: "How does tubeless affect tyre pressure?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Tubeless setups should run 8-10% lower pressure than equivalent clincher setups. Without an inner tube there is no pinch flat risk, so you can safely run lower pressures. The reduced hysteresis from eliminating the tube flexing against the tyre casing also lowers rolling resistance. For a rider running 90 PSI clincher on 25mm tyres, the tubeless equivalent would be approximately 82 PSI.",
              },
            },
            {
              "@type": "Question",
              name: "How does rim width affect tyre pressure?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Wider rims spread the tyre casing outward, increasing the effective air volume inside the tyre. This means you need less pressure to achieve the same tyre deflection and support. Each millimetre of additional rim internal width allows roughly 1.5% lower pressure. Modern road wheels with 21mm internal widths need noticeably less pressure than older 15mm rims with the same tyre size.",
              },
            },
            {
              "@type": "Question",
              name: "Should I reduce tyre pressure in wet conditions?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, dropping 3-5 PSI in wet conditions increases the contact patch between your tyre and the road, improving grip in corners and under braking. On rough or broken surfaces, drop 5-10% from your smooth-road pressure. On gravel, run 15-20% lower to maximise traction and reduce the tyre bouncing off loose surfaces. The goal is always to find the lowest pressure that avoids pinch flats or rim strikes.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
