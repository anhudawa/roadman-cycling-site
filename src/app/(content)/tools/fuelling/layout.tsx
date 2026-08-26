import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: { absolute: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium" },
  description:
    "Plan carbs, fluid and sodium per hour for any ride. Enter duration, intensity, power, weight and weather in this free, evidence-informed calculator.",
  keywords: ["cycling nutrition calculator", "cycling fuelling calculator", "cycling carb calculator", "carbs per hour cycling", "cycling fuel calculator"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium",
    description:
      "Plan carbs, fluid and sodium per hour from your ride duration, intensity, power, weight and weather.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="fuelling" />
      {children}
      <ToolJourney slug="fuelling" />
    </>
  );
}
