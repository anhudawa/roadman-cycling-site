import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: {
    absolute: "FTP Calculator: 7 Cycling Power Zones (2026)",
  },
  description:
    "Enter your FTP to calculate seven cycling power zones with gap-free watt ranges. Free, instant, coach-reviewed, with test guidance and evidence limits.",
  keywords: [
    "FTP calculator",
    "FTP zone calculator",
    "cycling power zones",
    "cycling training zones",
  ],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
  openGraph: {
    title: "FTP Calculator: 7 Cycling Power Zones (2026)",
    description:
      "Calculate seven cycling power zones from FTP, with gap-free watt ranges, test guidance and evidence limits.",
    type: "website",
    url: "https://roadmancycling.com/tools/ftp-zones",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="ftp-zones" />
      {children}
      <ToolJourney slug="ftp-zones" />
    </>
  );
}
