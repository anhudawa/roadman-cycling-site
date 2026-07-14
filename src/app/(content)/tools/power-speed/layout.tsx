import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Power-to-Speed Calculator — Convert Watts to km/h (and Back)",
  description:
    "Convert between cycling power and speed using real physics. Gradient, wind, riding position, rolling resistance, altitude — see exactly what your watts buy you on any road.",
  keywords: [
    "cycling power to speed calculator",
    "watts to km/h cycling",
    "cycling speed calculator",
    "bike power calculator",
    "cycling aero drag calculator",
    "watts per kg speed cycling",
  ],
  alternates: { canonical: "/tools/power-speed" },
  openGraph: {
    title: "Power-to-Speed Calculator — Convert Watts to km/h (and Back)",
    description:
      "Physics-based cycling calculator. Enter your watts and get speed, or enter speed and get the watts required. Gradient, wind, position, and rolling resistance included.",
    type: "website",
    url: "https://roadmancycling.com/tools/power-speed",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="power-speed" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Cycling Aerodynamics and Rolling Resistance Reference Data",
          description:
            "Physics-based reference data for cycling power-to-speed calculations: CdA values by riding position (tops through TT position), rolling resistance coefficients by surface type, and altitude-adjusted air density corrections.",
          url: "https://roadmancycling.com/tools/power-speed",
          identifier: "roadman-aero-reference-data-2026",
          creator: { "@id": ENTITY_IDS.organization },
          publisher: { "@id": ENTITY_IDS.organization },
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          variableMeasured: [
            "CdA (m²)",
            "Crr (rolling resistance coefficient)",
            "Speed (km/h)",
            "Power (watts)",
            "Gradient (%)",
            "Air density (kg/m³)",
          ],
          temporalCoverage: "2024/2026",
          measurementTechnique:
            "Standard cycling physics model using published CdA and Crr values, validated against wind tunnel data and real-world power meter recordings.",
        }}
      />
      {children}
      <ToolJourney slug="power-speed" />
    </>
  );
}
