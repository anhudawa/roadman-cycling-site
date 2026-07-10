import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Calories Burned Cycling Calculator — MET & Power-Based with Fuel Split",
  description:
    "How many calories you actually burn on the bike. Calculate from effort level or average power, see fat vs carb fuel split, and get post-ride refuelling targets.",
  keywords: ["calories burned cycling", "cycling calorie calculator", "calories per hour cycling", "cycling energy expenditure"],
  alternates: { canonical: "/tools/calories" },
  openGraph: {
    title: "Calories Burned Cycling Calculator — MET & Power-Based with Fuel Split",
    description:
      "How many calories you actually burn on the bike. MET or power-based calculation with fat/carb fuel split and post-ride refuelling guidance.",
    type: "website",
    url: "https://roadmancycling.com/tools/calories",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="calories" />
      {children}
      <ToolJourney slug="calories" />
    </>
  );
}
