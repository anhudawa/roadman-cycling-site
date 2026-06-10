import { getTourPhase } from "@/lib/tour";
import { TourCountdownHero } from "./TourCountdownHero";
import { TourLiveHero } from "./TourLiveHero";
import { TourFadeoutHero } from "./TourFadeoutHero";

/**
 * Homepage Tour overlay. Server-rendered selection of the right mode from
 * the current phase. Returns null when the overlay is off, so the homepage
 * falls back to its normal hero. The page is rendered with a short ISR
 * window so the phase stays fresh across the date boundaries.
 */
export function TourHomeHero() {
  const phase = getTourPhase();
  if (phase === "countdown") return <TourCountdownHero />;
  if (phase === "live") return <TourLiveHero />;
  if (phase === "fadeout") return <TourFadeoutHero />;
  return null;
}
