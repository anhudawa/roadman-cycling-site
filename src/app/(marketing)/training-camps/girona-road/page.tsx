import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.road;

export const metadata: Metadata = {
  title: "Girona Road Cycling Training Camp — 10–15 Oct 2026",
  description:
    "Road cycling camp in Girona, 10–15 October 2026. Six days on the pro climbs — Rocacorba, Els Àngels, Mare de Déu del Mont. Two pace groups, follow car, sixteen spots. €995.",
  keywords: [
    "Girona road cycling camp",
    "cycling training camp Girona",
    "road cycling holiday Spain",
    "Rocacorba training camp",
    "cycling camp October 2026",
    "Roadman Girona camp",
    "road cycling camp Europe",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-road",
  },
  openGraph: {
    title: `${camp.name} — 10–15 October 2026`,
    description:
      "Six days on Girona's pro climbs — Rocacorba, Els Àngels, Mare de Déu del Mont. Anthony in the group every day. €995, sixteen spots.",
    type: "website",
    url: "https://roadmancycling.com/training-camps/girona-road",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-road-coast.jpeg",
        alt: "Roadman Girona Road Cycling Training Camp — riders on a Costa Brava coastal road",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Girona Road Cycling Training Camp — Roadman 2026",
    description:
      "Six days on Girona's pro climbs. Sixteen spots, two pace groups, follow car, €995.",
  },
  robots: { index: true, follow: true },
};

export default function GironaRoadCampPage() {
  return <CampDetail camp={camp} />;
}
