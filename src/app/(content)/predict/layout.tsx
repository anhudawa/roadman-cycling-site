import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Race Time Predictor — Cycling Finish Times by Power, Course & Conditions",
  description:
    "Predict your sportive or gran fondo finish time from your FTP, weight, course profile and weather. Free, evidence-based, ±3% typical accuracy. Built by Roadman Cycling.",
  keywords: [
    "race time predictor",
    "cycling finish time calculator",
    "sportive predictor",
    "gran fondo predictor",
    "Étape du Tour predictor",
    "FTP race predictor",
    "cycling pacing calculator",
  ],
  alternates: { canonical: "https://roadmancycling.com/predict" },
  openGraph: {
    title: "Free Race Time Predictor — Cycling Finish Times by Power, Course & Conditions",
    description:
      "Predict your sportive finish time from FTP, weight, course profile and weather. Free, ±3% typical accuracy.",
    type: "website",
    url: "https://roadmancycling.com/predict",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Race Predictor" }],
  },
  robots: { index: true, follow: true },
};

export default function PredictLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
