import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Shock Pressure Calculator — Suspension Setup",
  description:
    "Free MTB suspension calculator. Get recommended shock pressure, fork PSI, and sag percentage for your weight and riding style — XC, trail, enduro, or DH.",
  keywords: ["shock pressure calculator", "suspension setup calculator", "mountain bike sag calculator", "fork pressure calculator"],
  alternates: { canonical: "https://roadmancycling.com/tools/shock-pressure" },
  openGraph: {
    title: "MTB Setup Calculator — Fork, Shock & Tyre Pressure",
    description:
      "Free MTB suspension calculator. Get recommended shock pressure, fork PSI, and sag percentage for your weight and riding style — XC, trail, enduro, or DH.",
    type: "website",
    url: "https://roadmancycling.com/tools/shock-pressure",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="shock-pressure" />
      {children}
    </>
  );
}
