import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.gravel;

export const metadata: Metadata = {
  title: `${camp.name} — 18–22 October 2026 | Roadman Cycling`,
  description:
    "Five days off the tarmac. Volcanic gravel in La Garrotxa, vineyard tracks of the Empordà, coastal paths above the Costa Brava. Two ride groups, sixteen spots, all-included from €995.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-gravel",
  },
  openGraph: {
    title: `${camp.name} — 18–22 October 2026`,
    description:
      "Five days on the dirt that built Girona's gravel reputation. Led by Anthony Walsh. Sixteen spots. €995.",
    type: "website",
    url: "https://roadmancycling.com/training-camps/girona-gravel",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-gravel-trail.webp",
        alt: "Two gravel riders on a dirt trail through Catalan countryside",
      },
    ],
  },
};

export default function GironaGravelCampPage() {
  return <CampDetail camp={camp} />;
}
