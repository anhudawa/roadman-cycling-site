import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "FTP Test Calculator — Estimate FTP from Any Protocol",
  description:
    "Enter your 20-minute, 8-minute, or ramp test result and get your estimated FTP. Includes W/kg, zone preview, and protocol comparison — free, no signup.",
  keywords: ["FTP test calculator", "20 minute FTP test", "ramp test FTP", "estimate FTP cycling", "FTP from 20 min test"],
  alternates: { canonical: "/tools/ftp-test" },
  openGraph: {
    title: "FTP Test Calculator — Estimate FTP from Any Protocol",
    description:
      "Estimate your FTP from any test protocol — 20-minute, 8-minute, ramp, or 60-minute. W/kg and zone preview included.",
    type: "website",
    url: "https://roadmancycling.com/tools/ftp-test",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="ftp-test" />
      {children}
      <ToolJourney slug="ftp-test" />
    </>
  );
}
