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
      {children}
    </>
  );
}
