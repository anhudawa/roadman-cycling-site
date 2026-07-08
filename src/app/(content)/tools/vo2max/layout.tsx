import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

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
      {children}
      <ToolJourney slug="vo2max" />
    </>
  );
}
