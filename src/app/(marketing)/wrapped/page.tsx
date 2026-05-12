import type { Metadata } from "next";
import { demoWrapped } from "@/data/wrapped-demo";
import { WrappedPage } from "./_components/WrappedPage";

export const metadata: Metadata = {
  title: "Roadman Season Wrapped — Your Year on the Bike",
  description:
    "Your year on the bike in eight cards. Distance, climbing, biggest month, longest ride, FTP gain, riding personality, streak — and what's next. Free, share-ready.",
  alternates: {
    canonical: "https://roadmancycling.com/wrapped",
  },
  openGraph: {
    title: "Roadman Season Wrapped — Your Year on the Bike",
    description:
      "Wrap your cycling year — eight share-ready cards, your numbers, your story. Free.",
    type: "website",
    url: "https://roadmancycling.com/wrapped",
  },
};

export default function Page() {
  return <WrappedPage demoData={demoWrapped} />;
}
