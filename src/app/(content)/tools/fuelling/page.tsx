import type { Metadata } from "next";
import { FuellingClient } from "./FuellingClient";

// Keep the public search owner static. Signed-in rider defaults are loaded by
// the client from a private API after hydration, so authentication cookies and
// profile database latency never hold up the crawlable calculator page.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium" },
  description:
    "Plan carbs, fluid and sodium per hour for any ride. Enter duration, intensity, power, weight and weather in this free, evidence-informed calculator.",
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium",
    description: "Plan carbs, fluid and sodium per hour from your ride duration, intensity, power, weight and weather.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling",
  },
};

export default function FuellingPage() {
  return <FuellingClient />;
}
