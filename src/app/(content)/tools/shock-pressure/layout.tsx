import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shock Pressure Calculator — Suspension Setup for Mountain Biking",
  description:
    "Calculate recommended air pressure and sag percentage for your suspension. Based on rider weight and riding style (XC, trail, enduro, DH).",
  keywords: ["shock pressure calculator", "suspension setup calculator", "mountain bike sag calculator", "fork pressure calculator"],
  alternates: { canonical: "https://roadmancycling.com/tools/shock-pressure" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
