import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("event-prep")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
  keywords: [
    "event-specific cycling coaching",
    "cycling coach for target event",
    "gran fondo coaching",
    "etape training plan coach",
    "marmotte coaching",
    "wicklow 200 coach",
    "race-day cycling coaching",
    "tapering for cycling event",
  ],
  alternates: {
    canonical: `https://roadmancycling.com/coaching/${data.slug}`,
  },
  openGraph: {
    title: data.seoTitle,
    description: data.seoDescription,
    type: "website",
    url: `https://roadmancycling.com/coaching/${data.slug}`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function EventPrepCoachingPage() {
  return <SegmentPage data={data} />;
}
