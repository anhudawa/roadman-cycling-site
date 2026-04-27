import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Sportives & Gran Fondos — Race Calendar",
  description:
    "Every event in the Roadman race-prediction calendar. Étape du Tour, La Marmotte, Mallorca 312, Wicklow 200 and more — pick your race and predict your finish.",
  alternates: { canonical: "https://roadmancycling.com/predict/courses" },
  openGraph: {
    title: "All Sportives & Gran Fondos — Race Calendar",
    description:
      "Every event in the Roadman race-prediction calendar. Pick your race and predict your finish.",
    type: "website",
    url: "https://roadmancycling.com/predict/courses",
  },
};

export default function PredictCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
