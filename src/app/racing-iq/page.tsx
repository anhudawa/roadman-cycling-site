import type { Metadata } from "next";
import { GameLoader } from "./GameLoader";
import "./racing-iq.css";

/**
 * Racing IQ — interactive racing-tactics game. Top-of-funnel asset:
 * Racing IQ → email (Beehiiv) → Plateau Diagnostic → Not Done Yet.
 *
 * Eventually intended for racingiq.roadmancycling.com (confirm with
 * Ted before any DNS work); shipping at /racing-iq until then.
 */

export const metadata: Metadata = {
  title: "Racing IQ — One Race, Seven Decisions",
  description:
    "A cinematic race simulation for serious amateur cyclists. Read the race, spend your matches, survive the crosswinds — and find out which rider you really are.",
  alternates: { canonical: "https://roadmancycling.com/racing-iq" },
  openGraph: {
    type: "website",
    title: "Racing IQ — One Race, Seven Decisions",
    description:
      "Most riders lose the race 40k before the finish. Play one race, make seven calls, get your Racing IQ profile.",
    url: "https://roadmancycling.com/racing-iq",
  },
};

export default function RacingIQPage() {
  return (
    <main id="main-content">
      <h1 className="sr-only">Racing IQ — the racing tactics game by Roadman Cycling</h1>
      <GameLoader />
    </main>
  );
}
