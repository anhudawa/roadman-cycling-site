import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In-Ride Fuelling Calculator — Carbs Per Hour for Cycling",
  description:
    "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
  keywords: ["cycling fuelling calculator", "carbs per hour cycling", "cycling nutrition calculator", "in ride nutrition"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
