import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tyre Pressure Calculator — Optimal PSI for Cycling",
  description:
    "Calculate optimal front and rear tyre pressure based on rider weight, tyre width, road surface, and conditions. Free cycling tool from Roadman Cycling.",
  keywords: ["tyre pressure calculator cycling", "bike tyre pressure", "cycling PSI calculator", "optimal tyre pressure"],
  alternates: { canonical: "https://roadmancycling.com/tools/tyre-pressure" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
