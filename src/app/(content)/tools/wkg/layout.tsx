import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling W/kg Calculator — FTP ÷ Body Weight",
  description:
    "Calculate cycling FTP watts per kilogram from power and body weight. See the formula, worked examples, reference ranges, evidence and interpretation limits.",
  keywords: ["w/kg calculator", "watts per kg cycling", "power to weight ratio", "cycling w/kg"],
  alternates: { canonical: "/tools/wkg" },
  openGraph: {
    title: "Cycling W/kg Calculator — FTP ÷ Body Weight",
    description:
      "Calculate FTP watts per kilogram, then interpret the result with transparent reference ranges and evidence limits.",
    type: "website",
    url: "https://roadmancycling.com/tools/wkg",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="wkg" />
      {children}
      <ToolJourney slug="wkg" />
    </>
  );
}
