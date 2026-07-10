import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Climbing Time Estimator — How Long to Climb Any Col",
  description:
    "Estimate how long it will take to climb any hill or col based on your power, weight, gradient, and distance. Physics-based model with famous climb comparisons.",
  keywords: [
    "climbing time calculator cycling",
    "how long to climb alpe d'huez",
    "cycling climb time estimator",
    "cycling hill time calculator",
    "col climbing time watts",
    "cycling power climbing speed",
  ],
  alternates: { canonical: "/tools/climb-time" },
  openGraph: {
    title: "Climbing Time Estimator — How Long to Climb Any Col",
    description:
      "Physics-based climb time calculator. Enter your power, weight, and the climb profile — get estimated time, average speed, VAM, and famous climb comparisons.",
    type: "website",
    url: "https://roadmancycling.com/tools/climb-time",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="climb-time" />
      {children}
      <ToolJourney slug="climb-time" />
    </>
  );
}
