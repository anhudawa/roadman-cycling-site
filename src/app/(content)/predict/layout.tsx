import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: {
    default: "Race Time Predictor — Free GPX-Based Sportive Calculator",
    template: "%s | Roadman Cycling",
  },
  description:
    "Predict your finish time on Étape, Marmotte, Wicklow 200, or any GPX route. Real elevation, wind, rolling resistance, and confidence ranges. Free.",
  alternates: { canonical: "https://roadmancycling.com/predict" },
  openGraph: {
    title: "Race Time Predictor — Free GPX-Based Sportive Calculator",
    description:
      "Predict your finish time on Étape, Marmotte, Wicklow 200, or any GPX route. Real elevation, real wind, real rolling resistance.",
    type: "website",
    url: "https://roadmancycling.com/predict",
  },
};

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Roadman Race Predictor"
        description="Predict your finish time on any sportive, gran fondo, or GPX route. Models real elevation, drafting, wind, drivetrain efficiency, and rider position to return a finish time with confidence range and climb-by-climb pacing."
        url="https://roadmancycling.com/predict"
        features={[
          "GPX upload or curated event library (Étape, Marmotte, Mallorca 312, Wicklow 200, RideLondon, and more)",
          "Climb-by-climb breakdown with category and gradient",
          "What-if sliders for FTP, weight, drafting, wind, drivetrain",
          "Confidence range based on physiological inputs",
          "Gap-to-cutoff bar for events with published sweep times",
          "Free; premium Race Report unlocks expanded scenarios",
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Race Predictor", item: "https://roadmancycling.com/predict" },
          ],
        }}
      />
      {children}
    </>
  );
}
