import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Fuel Planner — Daily Calories, Macros & In-Ride Carbs",
  description:
    "Free cycling nutrition calculator. Daily calorie target, carb/protein/fat split, in-ride carbs and hydration for the session you're riding — the fuel-for-the-work-required method the World Tour runs on.",
  keywords: [
    "cycling fuel planner",
    "cycling nutrition calculator",
    "cycling calorie calculator",
    "carbs per hour cycling",
    "cycling macro calculator",
  ],
  alternates: { canonical: "https://roadmancycling.com/tools/fuel-planner" },
  openGraph: {
    title: "Cycling Fuel Planner — Daily Calories, Macros & In-Ride Carbs",
    description:
      "Daily calorie target, macro split, in-ride carbs and hydration for the ride you're doing. The fuel-for-the-work-required method the World Tour runs on.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuel-planner",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="fuel-planner" />
      {children}
      <ToolJourney slug="fuel-planner" />
    </>
  );
}
