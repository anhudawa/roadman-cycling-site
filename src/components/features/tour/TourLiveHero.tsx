import { type ReactNode } from "react";
import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { TOUR_META, TOUR_TYPE_LABEL, type Stage } from "@/data/tour-de-france-2026";
import {
  getTodayStage,
  getYesterdayStage,
  getCompletedStages,
  getNextStage,
  isRestDay,
  formatStageDate,
} from "@/lib/tour";
import { STAGE_TYPE_COLOR } from "./stageMeta";
import { StageTypeIcon } from "./StageTypeIcon";
import { StageTimeline } from "./StageTimeline";
import { TourHeroBackdrop, Tricolour } from "./TourHeroBackdrop";

/** A single label-over-value block in the stat strip. */
function Stat({
  label,
  children,
  color,
}: {
  label: string;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="font-heading text-foreground-subtle text-[10px] tracking-[0.25em] mb-1">
        {label}
      </span>
      <span
        className="font-heading text-off-white text-lg sm:text-xl tracking-wide leading-none flex items-center gap-2"
        style={color ? { color } : undefined}
      >
        {children}
      </span>
    </div>
  );
}

/** A labelled placeholder card — honest about being awaiting-data, never fake. */
function PlaceholderCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-background-elevated p-5 h-full flex flex-col transition-colors hover:border-jersey-yellow/30">
      {/* Tricolour hairline */}
      <Tricolour className="absolute inset-x-0 top-0 h-[3px] w-full rounded-none opacity-70" />
      <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-2 mt-1">
        {eyebrow}
      </p>
      <p className="font-heading text-off-white text-xl tracking-wide mb-2">{title}</p>
      <p className="text-sm text-foreground-muted leading-relaxed">{body}</p>
      <div className="mt-4 space-y-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton skeleton-text w-6 h-3" />
            <div className="skeleton skeleton-text flex-1 h-3" />
            <div className="skeleton skeleton-text w-10 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayPanel({ stage }: { stage: Stage }) {
  const color = STAGE_TYPE_COLOR[stage.type];
  return (
    <Container className="relative z-10">
      {/* Oversized ghost stage numeral */}
      <span
        aria-hidden
        className="tdf-ghost-number pointer-events-none absolute -top-6 right-0 select-none font-heading leading-none text-jersey-yellow/[0.06] z-0"
        style={{ fontSize: "clamp(9rem, 26vw, 22rem)" }}
      >
        {stage.number}
      </span>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Tricolour className="h-3.5 w-7" />
          <span className="font-heading text-jersey-yellow text-xs sm:text-sm tracking-[0.3em]">
            TOUR DE FRANCE {TOUR_META.year}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-jersey-yellow/15 border border-jersey-yellow/40 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-jersey-yellow opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-jersey-yellow" />
            </span>
            <span className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em]">
              RACING TODAY
            </span>
          </span>
          <span className="font-heading text-foreground-muted text-sm tracking-wider">
            STAGE {stage.number} · {formatStageDate(stage.date).toUpperCase()}
          </span>
        </div>

        <div className="flex gap-4 sm:gap-5 mb-6">
          <Tricolour orientation="vertical" className="w-[5px] shrink-0 self-stretch rounded-full" />
          <h1
            className="font-heading text-off-white leading-[0.9]"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6.5rem)" }}
          >
            {stage.start}
            <span
              className="text-jersey-yellow px-2 inline-block"
              style={{ textShadow: "0 0 30px rgba(255,215,0,0.45)" }}
            >
              →
            </span>
            {stage.finish}
          </h1>
        </div>

        {/* Stat strip */}
        <div className="flex flex-wrap items-stretch gap-x-6 gap-y-4 mb-7 [&>*+*]:border-l [&>*+*]:border-white/10 [&>*+*]:pl-6">
          <Stat label="DISTANCE">
            <span className="tabular-nums">{stage.distanceKm}</span>
            <span className="text-foreground-subtle text-sm">KM</span>
          </Stat>
          <Stat label="TERRAIN" color={color}>
            <StageTypeIcon type={stage.type} className="w-5 h-5" />
            {TOUR_TYPE_LABEL[stage.type]}
          </Stat>
          {stage.summitFinish && (
            <Stat label="FINISH" color="var(--color-jersey-yellow)">
              SUMMIT
            </Stat>
          )}
          {stage.range && (
            <Stat label="MASSIF">
              <span className="text-off-white text-base font-body font-medium tracking-normal">
                {stage.range}
              </span>
            </Stat>
          )}
        </div>

        {stage.climbs.length > 0 && (
          <div className="mb-7">
            <p className="font-heading text-foreground-subtle text-xs tracking-[0.25em] mb-3">
              KEY CLIMBS
            </p>
            <div className="flex flex-wrap gap-2">
              {stage.climbs.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm"
                >
                  {c.category && (
                    <span
                      className="font-heading text-[10px] tracking-wider rounded px-1.5 py-0.5"
                      style={{ color, backgroundColor: `${color}22` }}
                    >
                      {c.category === "HC" ? "HC" : `CAT ${c.category}`}
                    </span>
                  )}
                  <span className="text-off-white">{c.name}</span>
                  {c.gradientPct != null && c.lengthKm != null && (
                    <span className="text-foreground-subtle tabular-nums text-xs">
                      {c.lengthKm}km · {c.gradientPct}%
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-foreground-muted max-w-2xl leading-relaxed mb-7">
          {stage.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button href={`/tour-de-france/stage/${stage.number}`} dataTrack="tour_live_stage">
            The Roadman Take on Stage {stage.number}
          </Button>
          <Button href="/tour-de-france" variant="ghost" dataTrack="tour_live_hub">
            Full Race Hub
          </Button>
        </div>
      </div>
    </Container>
  );
}

function RestOrTransitionPanel({ next }: { next?: Stage }) {
  return (
    <Container className="relative z-10 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Tricolour className="h-3.5 w-7" />
        <p className="font-heading text-jersey-yellow text-sm tracking-[0.3em]">
          TOUR DE FRANCE {TOUR_META.year}
        </p>
      </div>
      <h1
        className="font-heading text-off-white leading-[0.9] mb-5"
        style={{ fontSize: "var(--text-hero)" }}
      >
        REST<span className="text-jersey-yellow"> DAY</span>
      </h1>
      <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
        No racing today — the peloton recovers, and so should you. Recovery is where
        the work of the last week actually lands.
        {next && (
          <>
            {" "}
            Next up: Stage {next.number}, {next.start} → {next.finish} on{" "}
            {formatStageDate(next.date)}.
          </>
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button href="/tour-de-france" dataTrack="tour_restday_hub">
          Full Race Hub
        </Button>
        <Button href="/topics/cycling-recovery" variant="ghost">
          Recover Like a Pro
        </Button>
      </div>
    </Container>
  );
}

/**
 * Live mode (4–26 July). Today's stage leads inside a maillot-jaune, mountain-
 * silhouette hero; yesterday's result and the GC sit below as awaiting-data
 * placeholders (manually updated or API-fed). Rest days swap in a recovery
 * panel. The stage timeline closes the overlay.
 */
export function TourLiveHero() {
  const today = getTodayStage();
  const rest = isRestDay();
  const next = getNextStage();
  const yesterday = getYesterdayStage();
  const completed = getCompletedStages().map((s) => s.number);

  return (
    <>
      <Section background="deep-purple" grain className="pt-28 sm:pt-36 pb-16 sm:pb-20">
        <TourHeroBackdrop />
        {today && !rest ? <TodayPanel stage={today} /> : <RestOrTransitionPanel next={next} />}
      </Section>

      {/* Result / GC placeholders */}
      <Section background="charcoal" className="!py-12 border-y border-white/5">
        <Container>
          <div className="grid md:grid-cols-2 gap-4">
            <PlaceholderCard
              eyebrow={yesterday ? `STAGE ${yesterday.number} RESULT` : "LATEST RESULT"}
              title={yesterday ? `${yesterday.start} → ${yesterday.finish}` : "Awaiting first stage"}
              body={
                yesterday
                  ? "Yesterday's top three and the day's movers — updated as results come in."
                  : "Stage results appear here once the racing starts."
              }
            />
            <PlaceholderCard
              eyebrow="GENERAL CLASSIFICATION"
              title="Yellow Jersey Standings"
              body="The overall top ten and time gaps — refreshed after each stage finishes."
            />
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" className="!py-12">
        <Container>
          <div className="flex items-end justify-between mb-5">
            <div className="flex items-center gap-3">
              <Tricolour className="h-4 w-8" />
              <h2 className="font-heading text-off-white text-2xl sm:text-3xl tracking-wide">
                THE RACE SO FAR
              </h2>
            </div>
            <Link
              href="/tour-de-france"
              className="font-heading text-jersey-yellow hover:text-jersey-yellow-deep text-sm tracking-wider transition-colors shrink-0"
            >
              VIEW ALL →
            </Link>
          </div>
          <StageTimeline todayNumber={today?.number} completedNumbers={completed} />
        </Container>
      </Section>
    </>
  );
}
