import type { Metadata } from "next";
import { FuelPlannerClient } from "./FuelPlannerClient";

export const metadata: Metadata = {
  title: "Cycling Fuel Planner — Daily Calories, Macros & In-Ride Carbs",
  description:
    "Free cycling nutrition calculator. Get your daily calorie target, carb/protein/fat split, in-ride carbs and hydration for the session you're riding. Built on fuel-for-the-work-required.",
  alternates: {
    canonical: "https://roadmancycling.com/tools/fuel-planner",
  },
  openGraph: {
    title: "Cycling Fuel Planner — Daily Calories, Macros & In-Ride Carbs",
    description:
      "Get your daily calorie target, macro split, in-ride carbs and hydration for the ride you're doing. Free, no signup. Fuel-for-the-work-required.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuel-planner",
  },
};

export default function FuelPlannerPage() {
  return <FuelPlannerClient />;
}
