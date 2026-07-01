import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "MTB Shock & Fork Pressure Calculator — Suspension Setup",
  description:
    "Dial in fork and shock pressure plus sag for your weight and riding style — XC, trail, enduro or DH. Free, no signup. A sensible starting point before you tune by feel.",
  keywords: ["shock pressure calculator", "suspension setup calculator", "mountain bike sag calculator", "fork pressure calculator"],
  alternates: { canonical: "/tools/shock-pressure" },
  openGraph: {
    title: "MTB Shock & Fork Pressure Calculator — Suspension Setup",
    description:
      "Dial in fork and shock pressure plus sag for your weight and riding style — XC, trail, enduro or DH. A sensible starting point before you tune by feel.",
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
      <ToolJourney slug="shock-pressure" />
    </>
  );
}
