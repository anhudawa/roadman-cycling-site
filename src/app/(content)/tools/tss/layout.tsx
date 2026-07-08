import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

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
      {children}
      <ToolJourney slug="tss" />
    </>
  );
}
