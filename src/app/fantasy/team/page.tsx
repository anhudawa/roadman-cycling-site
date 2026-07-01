import type { Metadata } from "next";
import { TeamDashboard } from "@/components/features/fantasy/TeamDashboard";

export const metadata: Metadata = {
  title: "My team",
  description: "Your Roadman Fantasy Tour squad: points, transfers, captain, mini-leagues.",
  robots: { index: false },
};

export default function TeamPage() {
  return <TeamDashboard />;
}
