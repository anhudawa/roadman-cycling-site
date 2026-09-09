import type { Metadata } from "next";
import FA40NewsletterLanding from "./FA40NewsletterLanding";

export const metadata: Metadata = {
  title: "Faster After 40 — Free Cycling Report | Roadman Cycling",
  description:
    "A free Roadman Cycling report for riders over 40 covering training, fuelling, strength, recovery, and practical habits for better riding.",
  alternates: {
    canonical: "https://roadmancycling.com/faster-after-40",
  },
  openGraph: {
    title: "Faster After 40 — Free Cycling Report",
    description:
      "Get the Faster After 40 report and join The Saturday Spin: one useful training letter every Saturday.",
    type: "website",
    url: "https://roadmancycling.com/faster-after-40",
  },
};

export default function FasterAfter40Page() {
  return <FA40NewsletterLanding />;
}
