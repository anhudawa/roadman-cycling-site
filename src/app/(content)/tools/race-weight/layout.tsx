import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Race Weight Calculator — Your Target Cycling Weight Range",
  description:
    "Your target race-weight range for the event you're training for. Built on competitive cyclist body-composition ranges, not BMI. Sane numbers, not an Instagram fantasy.",
  keywords: ["race weight calculator", "cycling race weight", "cycling body composition", "power to weight cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/race-weight" },
  openGraph: {
    title: "Race Weight Calculator — Your Target Cycling Weight Range",
    description:
      "Your target race-weight range for the event you're training for. Built on competitive cyclist body-composition ranges, not BMI.",
    type: "website",
    url: "https://roadmancycling.com/tools/race-weight",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="race-weight" />
      {children}
      <ToolJourney slug="race-weight" />
    </>
  );
}
