import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { TOUR_META } from "@/data/tour-de-france-2026";
import { formatStageDate } from "@/lib/tour";
import { CountdownTimer } from "./CountdownTimer";
import { StageTimeline } from "./StageTimeline";

/**
 * Countdown mode (now → 3 July). The homepage hero becomes a live clock to
 * the Grand Départ, with the full stage timeline stacked below.
 */
export function TourCountdownHero() {
  return (
    <>
      <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-14">
        <Container className="text-center">
          <p className="font-heading text-jersey-yellow text-xs sm:text-sm tracking-[0.3em] mb-4">
            GRAND DÉPART · {TOUR_META.grandDepart.toUpperCase()} ·{" "}
            {formatStageDate(TOUR_META.startDate).toUpperCase()}
          </p>
          <h1
            className="font-heading text-off-white leading-[0.9] mb-8"
            style={{ fontSize: "var(--text-hero)" }}
          >
            THE TOUR<span className="text-jersey-yellow"> IS COMING</span>
          </h1>

          <div className="mb-8">
            <CountdownTimer />
          </div>

          <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Three weeks, {TOUR_META.stageCount} stages, {TOUR_META.totalDistanceKm.toLocaleString()}km
            and five mountain ranges — from a Barcelona team time trial to back-to-back
            Alpe d&rsquo;Huez finishes. We&rsquo;re covering all of it the Roadman way:
            what every stage demands, and the training that builds it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/tour-de-france" dataTrack="tour_countdown_hub">
              Full Route &amp; Stages
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="charcoal" className="!py-12 border-y border-white/5">
        <Container>
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-heading text-off-white text-2xl sm:text-3xl tracking-wide">
              ALL {TOUR_META.stageCount} STAGES
            </h2>
            <Link
              href="/tour-de-france"
              className="font-heading text-jersey-yellow hover:text-jersey-yellow-deep text-sm tracking-wider transition-colors shrink-0"
            >
              VIEW ALL →
            </Link>
          </div>
          <StageTimeline />
        </Container>
      </Section>
    </>
  );
}
