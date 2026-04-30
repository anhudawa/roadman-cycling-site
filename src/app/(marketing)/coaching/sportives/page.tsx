import type { Metadata } from "next";
import { SegmentPage } from "@/components/segments/SegmentPage";
import { getSegment } from "@/lib/coaching-segments";

const data = getSegment("sportives")!;

export const metadata: Metadata = {
  title: data.seoTitle,
  description: data.seoDescription,
  keywords: [
    "sportive cycling coach",
    "gran fondo cycling coach",
    "online cycling coach for sportives",
    "sportive training plan",
    "etape du tour coach",
    "marmotte coaching",
    "wicklow 200 coaching",
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

export default function SportivesCoachingPage() {
  return <SegmentPage data={data} />;
}
