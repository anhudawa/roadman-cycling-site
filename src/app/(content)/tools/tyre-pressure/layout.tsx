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
      {children}
    </>
  );
}
