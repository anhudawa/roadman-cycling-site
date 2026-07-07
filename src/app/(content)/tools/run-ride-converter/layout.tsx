import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Run↔Ride Equivalence Converter — Running Pace to Cycling FTP",
  description:
    "Convert a running pace or race time into an equivalent cycling FTP, or a bike FTP into equivalent running race times. Free tool using VO2max as the bridge between the two sports.",
  keywords: [
    "run to bike converter",
    "running pace to FTP",
    "VDOT to FTP calculator",
    "cycling to running equivalent",
    "cross training calculator",
  ],
  alternates: { canonical: "/tools/run-ride-converter" },
  openGraph: {
    title: "Run↔Ride Equivalence Converter — Running Pace to Cycling FTP",
    description:
      "Convert between running pace and cycling power. Estimates equivalent efforts across both sports using VO2max as the bridge.",
    type: "website",
    url: "https://roadmancycling.com/tools/run-ride-converter",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="run-ride-converter" />
      {children}
      <ToolJourney slug="run-ride-converter" />
    </>
  );
}
