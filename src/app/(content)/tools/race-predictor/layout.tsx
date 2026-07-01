import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Race Time Predictor — Physics-Based Cycling Finish-Time Calculator",
  description:
    "Predict your cycling race or sportive finish time from real physics — gravity, rolling resistance, aero drag, drivetrain loss. Enter weight, power, distance and climbing for an estimated time, average speed, and average power. Free.",
  keywords: [
    "race time predictor cycling",
    "cycling finish time calculator",
    "bike speed calculator power",
    "cycling power to speed calculator",
    "sportive time predictor",
  ],
  alternates: { canonical: "/tools/race-predictor" },
  openGraph: {
    title: "Race Time Predictor — Physics-Based Cycling Finish-Time Calculator",
    description:
      "Enter your weight, power, and the course. Real cycling physics returns your estimated finish time, average speed, and average power — free.",
    type: "website",
    url: "https://roadmancycling.com/tools/race-predictor",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="race-predictor" />
      {children}
      <ToolJourney slug="race-predictor" />
    </>
  );
}
