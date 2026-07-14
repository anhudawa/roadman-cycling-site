import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "TSS Calculator — Training Stress Score from Power + Duration",
  description:
    "Calculate Training Stress Score from your ride duration, power, and FTP. See recovery benchmarks and training load interpretation — no signup required.",
  keywords: ["TSS calculator", "training stress score", "cycling TSS", "normalised power TSS", "training load cycling"],
  alternates: { canonical: "/tools/tss" },
  openGraph: {
    title: "TSS Calculator — Training Stress Score from Power + Duration",
    description:
      "Calculate Training Stress Score from your ride duration, power, and FTP. Recovery benchmarks and training load interpretation included.",
    type: "website",
    url: "https://roadmancycling.com/tools/tss",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="tss" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Training Stress Score Benchmarks and Recovery Thresholds",
          description:
            "TSS benchmark bands for cycling training load classification — from low (recovery rides) through ultra (Ironman-level) — with associated recovery timeframes and intensity factor reference data.",
          url: "https://roadmancycling.com/tools/tss",
          identifier: "roadman-tss-benchmarks-2026",
          creator: { "@id": ENTITY_IDS.organization },
          publisher: { "@id": ENTITY_IDS.organization },
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          variableMeasured: [
            "Training Stress Score (TSS)",
            "Intensity Factor (IF)",
            "Duration",
            "Recovery time",
          ],
          temporalCoverage: "2024/2026",
          measurementTechnique:
            "Benchmark bands derived from the Coggan TSS model and calibrated against training data from coached amateur cyclists.",
        }}
      />
      {children}
      <ToolJourney slug="tss" />
    </>
  );
}
