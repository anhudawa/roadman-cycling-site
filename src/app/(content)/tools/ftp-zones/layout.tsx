import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "FTP Power Zone Calculator — Your 7 Cycling Training Zones",
  description:
    "Enter your FTP, get your 7 cycling power zones instantly. Free, no signup. The same Coggan zone model the World Tour coaches on the podcast use to write training plans.",
  keywords: ["FTP zone calculator", "cycling power zones", "FTP calculator", "training zones cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
  openGraph: {
    title: "FTP Power Zone Calculator — Your 7 Cycling Training Zones",
    description:
      "Enter your FTP, get your 7 cycling power zones instantly. The same Coggan zone model the World Tour coaches on the podcast use.",
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
