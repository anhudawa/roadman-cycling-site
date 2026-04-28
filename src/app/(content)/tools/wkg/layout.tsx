import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "W/kg Calculator — Cycling Power-to-Weight Ratio",
  description:
    "Calculate your cycling power-to-weight ratio (W/kg) instantly. Compare against amateur, competitive, and professional benchmarks.",
  keywords: ["w/kg calculator", "watts per kg cycling", "power to weight ratio", "cycling w/kg"],
  alternates: { canonical: "https://roadmancycling.com/tools/wkg" },
  openGraph: {
    title: "W/kg Calculator — Cycling Power-to-Weight Ratio",
    description:
      "Calculate your cycling power-to-weight ratio (W/kg) instantly. Compare against amateur, competitive, and professional benchmarks.",
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
    </>
  );
}
