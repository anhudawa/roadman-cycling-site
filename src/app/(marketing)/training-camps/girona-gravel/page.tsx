import type { Metadata } from "next";
import { CAMPS } from "@/lib/camps/camps";
import { CampDetail } from "../_components/CampDetail";

const camp = CAMPS.gravel;

export const metadata: Metadata = {
  title: `Girona Gravel Cycling Camp — 16–21 Oct 2026 | Roadman`,
  description:
    "Gravel cycling camp in Girona, Spain — 16–21 October 2026. Six days off the tarmac on La Garrotxa volcanic dirt, Les Gavarres cork-oak singletrack, Empordà vineyard tracks and Costa Brava gravel. Two pace groups, sixteen spots, €995.",
  keywords: [
    "Girona gravel camp",
    "gravel cycling camp",
    "gravel cycling camp Spain",
    "gravel cycling holiday",
    "La Garrotxa gravel",
    "Les Gavarres gravel",
    "Empordà gravel",
    "Roadman gravel camp",
    "cycling camp October 2026",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/training-camps/girona-gravel",
  },
  openGraph: {
    title: `${camp.name} — 16–21 October 2026`,
    description:
      "Six days on the dirt that built Girona's gravel reputation. Volcanic, vineyard, forest and coastal terrain. Anthony in the group every day. €995, sixteen spots.",
    type: "website",
    url: "https://roadmancycling.com/training-camps/girona-gravel",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-gravel-trail.webp",
        alt: "Roadman Girona Gravel Camp — riders on a dirt trail through Catalan countryside",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Girona Gravel Cycling Camp — Roadman 2026",
    description:
      "Six days off the tarmac in Girona. Volcanic, vineyard, forest and coastal terrain. €995, sixteen spots.",
  },
  robots: { index: true, follow: true },
};

export default function GironaGravelCampPage() {
  return <CampDetail camp={camp} />;
}
