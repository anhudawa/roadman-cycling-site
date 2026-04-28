import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Cycling Carbs-Per-Hour Calculator — Fuel by Ride Duration",
  description:
    "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
  keywords: ["cycling fuelling calculator", "carbs per hour cycling", "cycling nutrition calculator", "in ride nutrition"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "Cycling Carbs-Per-Hour Calculator — Fuel by Ride Duration",
    description:
      "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
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
    </>
  );
}
