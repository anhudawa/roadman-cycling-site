import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("time-crunched")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
  keywords: [
    "time crunched cycling coach",
    "online cycling coach for time-crunched cyclists",
    "cycling coach 6 hours week",
    "cycling coach for busy cyclists",
    "time-crunched cyclist training plan",
    "indoor cycling coach",
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

export default function TimeCrunchedCoachingPage() {
  return <SegmentPage data={data} />;
}
