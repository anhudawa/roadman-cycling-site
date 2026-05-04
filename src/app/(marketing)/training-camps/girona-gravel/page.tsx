import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.gravel;

export const metadata: Metadata = {
  title: `${camp.name} — 16–21 October 2026 | Roadman Cycling`,
  description:
    "Five days off the tarmac on the dirt that built Girona's gravel name. Volcanic tracks in La Garrotxa, cork-oak singletrack in Les Gavarres, vineyard service roads in the Empordà, coastal lines above the Med. Two pace groups, sixteen spots. €995.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-gravel",
  },
  openGraph: {
    title: `${camp.name} — 16–21 October 2026`,
    description:
      "Five days on the dirt that built Girona's gravel reputation. Anthony in the group every day. €995, sixteen spots.",
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
