import type { Metadata } from "next";
import FA40Squeeze from "./FA40Squeeze";

export const metadata: Metadata = {
  title: "Faster After 40 — Free Guide by Roadman Cycling",
  description:
    "A free 30-page guide on what World Tour coaches actually prescribe to riders over 40. The 5-pillar system behind every cyclist who got quicker when everyone said they wouldn't.",
  alternates: {
    canonical: "https://roadmancycling.com/faster-after-40",
  },
  openGraph: {
    title:
      "Faster After 40 — What World Tour Coaches Actually Prescribe to Riders Your Age",
    description:
      "A free 30-page field manual built from conversations with Dan Lorang, Professor Seiler, and the coaches behind Grand Tour wins. For cyclists who refuse to slow down.",
    type: "website",
    url: "https://roadmancycling.com/faster-after-40",
  },
};

export default function FasterAfter40Page() {
  return <FA40Squeeze />;
}
