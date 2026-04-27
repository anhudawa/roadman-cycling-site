import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Race Time Predictor — Free GPX-Based Sportive Calculator",
    template: "%s | Roadman Cycling",
  },
  description:
    "Predict your finish time on Étape, Marmotte, Wicklow 200, or any GPX route. Real elevation, real wind, real rolling resistance — typical accuracy ±3%. Free.",
  alternates: { canonical: "https://roadmancycling.com/predict" },
  openGraph: {
    title: "Race Time Predictor — Free GPX-Based Sportive Calculator",
    description:
      "Predict your finish time on Étape, Marmotte, Wicklow 200, or any GPX route. Real elevation, real wind, real rolling resistance.",
    type: "website",
    url: "https://roadmancycling.com/predict",
  },
};

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return children;
}
