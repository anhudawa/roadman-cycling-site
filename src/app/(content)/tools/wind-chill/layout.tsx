import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Wind Chill Calculator for Cyclists — Feels-Like Temperature on the Bike",
  description:
    "Calculate the wind chill effect at cycling speed. Enter air temperature, riding speed, and wind conditions to see what it actually feels like on the bike — with clothing recommendations and descent scenarios.",
  keywords: ["wind chill calculator cycling", "cycling wind chill", "feels like temperature cycling", "cycling cold weather", "wind chill on bike", "descent wind chill cycling"],
  alternates: { canonical: "/tools/wind-chill" },
  openGraph: {
    title: "Wind Chill Calculator for Cyclists — Feels-Like Temperature on the Bike",
    description:
      "Calculate the wind chill effect at cycling speed. Enter air temperature, riding speed, and wind conditions to see what it actually feels like on the bike — with clothing recommendations and descent scenarios.",
    type: "website",
    url: "https://roadmancycling.com/tools/wind-chill",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="wind-chill" />
      {children}
      <ToolJourney slug="wind-chill" />
    </>
  );
}
