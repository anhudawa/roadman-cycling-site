import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
  description:
    "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
  keywords: ["FTP zone calculator", "cycling power zones", "FTP calculator", "training zones cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
  openGraph: {
    title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
    description:
      "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
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
    </>
  );
}
