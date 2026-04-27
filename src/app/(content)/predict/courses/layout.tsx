import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Race Predictor Course Catalog — Find Your Sportive | Roadman Cycling",
  },
  description:
    "Browse the courses available in the Roadman Race Predictor — Étape du Tour, La Marmotte, Mallorca 312, RideLondon, and more. Filter by distance, elevation and country. Predict your finish time in seconds.",
  alternates: { canonical: "https://roadmancycling.com/predict/courses" },
  openGraph: {
    title: "Race Predictor Course Catalog — Find Your Sportive",
    description:
      "Browse predictor-ready courses by distance, elevation and country. Click any course to predict your finish.",
    type: "website",
    url: "https://roadmancycling.com/predict/courses",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Race Predictor courses" }],
  },
  robots: { index: true, follow: true },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
