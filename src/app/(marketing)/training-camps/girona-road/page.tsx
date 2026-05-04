import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.road;

export const metadata: Metadata = {
  title: `${camp.name} — 13–17 October 2026 | Roadman Cycling`,
  description:
    "Five days riding Rocacorba, Els Àngels, and the classic Girona roads. Two ride groups, sixteen spots, all-included from €995. Led by Anthony Walsh and the Roadman team.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-road",
  },
  openGraph: {
    title: `${camp.name} — 13–17 October 2026`,
    description:
      "Five days on the roads pros use to build their seasons. Led by Anthony Walsh. Sixteen spots. €995.",
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
