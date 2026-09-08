import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Training Load Calculator — CTL, ATL & TSB from Daily TSS",
  description:
    "Calculate CTL, ATL and TSB from starting load and daily TSS. See the formulas, a worked rest-day example and how to interpret the result. No signup required.",
  keywords: ["CTL calculator", "ATL calculator", "TSB calculator", "training load cycling", "performance management chart", "fitness fatigue model"],
  alternates: { canonical: "/tools/training-load" },
  openGraph: {
    title: "Training Load Calculator — CTL, ATL & TSB from Daily TSS",
    description:
      "Model CTL, ATL and TSB from starting values and daily TSS, with clear timing, formulas and a worked example.",
    type: "website",
    url: "https://roadmancycling.com/tools/training-load",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="training-load" />
      {children}
      <ToolJourney slug="training-load" />
    </>
  );
}
