import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "W/kg Calculator — Cycling Power-to-Weight Ratio + Benchmarks",
  description:
    "Your power-to-weight ratio plus where it actually places you. Free W/kg calculator with amateur, competitive and pro benchmarks — and what the next band of riders trains like.",
  keywords: ["w/kg calculator", "watts per kg cycling", "power to weight ratio", "cycling w/kg"],
  alternates: { canonical: "/tools/wkg" },
  openGraph: {
    title: "W/kg Calculator — Cycling Power-to-Weight Ratio + Benchmarks",
    description:
      "Your power-to-weight ratio plus where it actually places you. With amateur, competitive and pro benchmarks side by side.",
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
