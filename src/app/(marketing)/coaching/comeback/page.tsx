import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("comeback")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
  keywords: [
    "cycling comeback coaching",
    "online cycling coach for returning riders",
    "cycling coaching after break",
    "comeback cycling training plan",
    "cycling return after injury",
    "cycling return after life break",
    "reclaim cycling fitness",
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

export default function ComebackCoachingPage() {
  return <SegmentPage data={data} />;
}
