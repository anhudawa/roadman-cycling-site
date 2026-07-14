import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "VO2max Estimator — From MAP or FTP with Age-Adjusted Percentiles",
  description:
    "Estimate your VO2max from ramp test peak power or FTP. Age-adjusted percentiles, masters benchmarks, and classification from recreational to world-class.",
  keywords: ["vo2max estimator", "vo2max calculator", "vo2max from ftp", "vo2max from map", "cycling vo2max", "masters vo2max"],
  alternates: { canonical: "/tools/vo2max" },
  openGraph: {
    title: "VO2max Estimator — From MAP or FTP with Age-Adjusted Percentiles",
    description:
      "Estimate your VO2max from ramp test peak power or FTP. Age-adjusted percentiles and masters benchmarks side by side.",
    type: "website",
    url: "https://roadmancycling.com/tools/vo2max",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="vo2max" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "VO2max Percentile Data by Age and Gender",
          description:
            "Age-adjusted VO2max percentile tables (ACSM-based) for male and female cyclists by decade, from 20-29 through 70+. Classification bands from below average to world-class.",
          url: "https://roadmancycling.com/tools/vo2max",
          identifier: "roadman-vo2max-percentiles-2026",
          creator: { "@id": ENTITY_IDS.organization },
          publisher: { "@id": ENTITY_IDS.organization },
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          variableMeasured: [
            "VO2max (ml/kg/min)",
            "Age",
            "Gender",
            "Percentile",
            "Classification band",
          ],
          temporalCoverage: "2024/2026",
          measurementTechnique:
            "Simplified percentile tables derived from ACSM reference data, calibrated against cycling-specific VO2max estimation from maximum aerobic power (MAP) and FTP.",
        }}
      />
      {children}
      <ToolJourney slug="vo2max" />
    </>
  );
}
