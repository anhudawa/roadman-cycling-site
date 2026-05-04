import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.road;

export const metadata: Metadata = {
  title: `${camp.name} — 10–15 October 2026 | Roadman Cycling`,
  description:
    "Five days on the climbs Girona's pros ride twelve months a year — Rocacorba, Els Àngels, Mare de Déu del Mont. Two pace groups, follow car, sixteen spots. €995 from a private Catalan farmhouse.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-road",
  },
  openGraph: {
    title: `${camp.name} — 10–15 October 2026`,
    description:
      "Five days on the climbs the World Tour rides twelve months a year. Anthony in the group every day. €995, sixteen spots.",
    type: "website",
    url: "https://roadmancycling.com/training-camps/girona-road",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-road-coast.jpeg",
        alt: "Group of road cyclists on a coastal road above a turquoise Costa Brava cove",
      },
    ],
  },
};

export default function GironaRoadCampPage() {
  return <CampDetail camp={camp} />;
}
