import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Power-to-Speed Calculator — Convert Watts to km/h (and Back)",
  description:
    "Convert between cycling power and speed using real physics. Gradient, wind, riding position, rolling resistance, altitude — see exactly what your watts buy you on any road.",
  keywords: [
    "cycling power to speed calculator",
    "watts to km/h cycling",
    "cycling speed calculator",
    "bike power calculator",
    "cycling aero drag calculator",
    "watts per kg speed cycling",
  ],
  alternates: { canonical: "/tools/power-speed" },
  openGraph: {
    title: "Power-to-Speed Calculator — Convert Watts to km/h (and Back)",
    description:
      "Physics-based cycling calculator. Enter your watts and get speed, or enter speed and get the watts required. Gradient, wind, position, and rolling resistance included.",
    type: "website",
    url: "https://roadmancycling.com/tools/power-speed",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="power-speed" />
      {children}
      <ToolJourney slug="power-speed" />
    </>
  );
}
