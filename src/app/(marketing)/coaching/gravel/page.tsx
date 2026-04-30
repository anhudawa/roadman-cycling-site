import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("gravel")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
  keywords: [
    "gravel cycling coach",
    "online gravel coach",
    "gravel racing coach",
    "unbound gravel coaching",
    "dirty reiver coach",
    "gravel race training plan",
    "ultra-distance gravel coaching",
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

export default function GravelCoachingPage() {
  return <SegmentPage data={data} />;
}
