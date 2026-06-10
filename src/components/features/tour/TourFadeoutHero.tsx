import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { TOUR_META } from "@/data/tour-de-france-2026";
import { StageTimeline } from "./StageTimeline";

/**
 * Fade-out mode (27 July → OVERLAY_END). The race is over; the overlay
 * carries a summary and the relive-the-route archive, then removes itself
 * once OVERLAY_END passes and the homepage returns to normal.
 */
export function TourFadeoutHero() {
  return (
    <>
      <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-14">
        <Container className="text-center">
          <p className="font-heading text-jersey-yellow text-sm tracking-[0.3em] mb-4">
            TOUR DE FRANCE {TOUR_META.year} · THAT&rsquo;S A WRAP
          </p>
          <h1
            className="font-heading text-off-white leading-[0.9] mb-6"
            style={{ fontSize: "var(--text-hero)" }}
          >
            ROLLED INTO<span className="text-jersey-yellow"> PARIS</span>
          </h1>
          <p className="text-foreground-muted max-w-xl mx-auto mb-6 leading-relaxed">
            {TOUR_META.stageCount} stages, {TOUR_META.totalDistanceKm.toLocaleString()}km,
            {" "}five mountain ranges and two summit finishes on Alpe d&rsquo;Huez. The
            race is done — relive every stage and the training lessons it left behind.
          </p>

          <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-jersey-yellow/25 bg-jersey-yellow/[0.06] px-6 py-4 mb-8">
            <span className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em]">
              FINAL GENERAL CLASSIFICATION
            </span>
            <span className="font-heading text-off-white text-xl tracking-wide">
              Champion to be confirmed
            </span>
            <span className="text-xs text-foreground-muted">
              Final podium and jersey winners land here once Paris is settled.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/tour-de-france" dataTrack="tour_fadeout_hub">
              Relive Every Stage
            </Button>
            <Button href="/podcast" variant="ghost">
              The Roadman Archive
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="charcoal" className="!py-12 border-y border-white/5">
        <Container>
          <h2 className="font-heading text-off-white text-2xl sm:text-3xl tracking-wide mb-5">
            THE FULL ROUTE
          </h2>
          <StageTimeline />
        </Container>
      </Section>
    </>
  );
}
