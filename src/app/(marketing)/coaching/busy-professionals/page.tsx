import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("busy-professionals")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
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

export default function BusyProfessionalsCoachingPage() {
  return <SegmentPage data={data} />;
}
