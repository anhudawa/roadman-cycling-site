import type { Metadata } from "next";
import { TeamBuilder } from "@/components/features/fantasy/TeamBuilder";

export const metadata: Metadata = {
  title: "Build your team",
  description:
    "8 riders, 100 credits, max 3 per trade team. Build your Roadman Fantasy Tour squad — no signup needed until you save.",
};

export default function BuildPage() {
  return <TeamBuilder />;
}
