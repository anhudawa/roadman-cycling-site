import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Body Composition Calculator | Roadman Cycling",
  description:
    "Estimate body fat, lean mass, and fat mass using the US Navy method. Cycling-specific W/kg projections, minimum safe racing weight, and RED-S risk flags. Free, no signup.",
  keywords: ["body composition calculator", "cycling body fat", "body fat percentage cycling", "navy method body fat", "cyclist body composition", "W/kg body composition"],
  alternates: { canonical: "/tools/body-composition" },
  openGraph: {
    title: "Cycling Body Composition Calculator | Roadman Cycling",
    description:
      "Estimate body fat, lean mass, and fat mass using the US Navy method. Cycling-specific W/kg projections and RED-S risk flags.",
    type: "website",
    url: "https://roadmancycling.com/tools/body-composition",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="body-composition" />
      {children}
      <ToolJourney slug="body-composition" />
    </>
  );
}
