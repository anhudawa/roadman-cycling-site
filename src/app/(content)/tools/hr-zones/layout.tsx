import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Heart Rate Zones Calculator: Max HR or LTHR",
  description:
    "Calculate five continuous cycling heart rate zones from measured max HR or a cycling LTHR estimate. See the exact method, examples and evidence limits.",
  keywords: ["cycling heart rate zones", "cycling HR zones", "cycling heart rate zone calculator", "heart rate training zones", "LTHR zones"],
  alternates: { canonical: "/tools/hr-zones" },
  openGraph: {
    title: "Cycling Heart Rate Zones Calculator: Max HR or LTHR",
    description: "Calculate five continuous cycling heart-rate zones with a transparent Max-HR or cycling-LTHR method, worked examples and evidence limits.",
    type: "website",
    url: "https://roadmancycling.com/tools/hr-zones",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="hr-zones" />
      {children}
      <ToolJourney slug="hr-zones" />
    </>
  );
}
