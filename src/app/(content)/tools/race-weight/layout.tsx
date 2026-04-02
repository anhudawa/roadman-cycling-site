import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Weight Calculator — Target Weight for Peak Cycling Performance",
  description:
    "Calculate your target race weight based on body composition and event type. Free cycling tool based on competitive cyclist reference ranges.",
  keywords: ["race weight calculator", "cycling race weight", "cycling body composition", "power to weight cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/race-weight" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
