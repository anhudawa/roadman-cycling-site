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
import { FantasyPlaceholder } from "./FantasyPlaceholder";

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
    <div className="rounded-xl border border-white/8 bg-background-elevated p-5 h-full flex flex-col">
      <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-2">
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
    <Container>
      <div className="flex items-center gap-3 mb-4">
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

      <h1
        className="font-heading text-off-white leading-[0.95] mb-5"
        style={{ fontSize: "var(--text-section)" }}
      >
        {stage.start}
        <span className="text-jersey-yellow px-2">→</span>
        {stage.finish}
      </h1>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
        <span
          className="inline-flex items-center gap-2 font-heading tracking-wider"
          style={{ color }}
        >
          <StageTypeIcon type={stage.type} className="w-5 h-5" />
          {TOUR_TYPE_LABEL[stage.type]}
        </span>
        <span className="text-off-white font-heading text-lg tabular-nums">
          {stage.distanceKm} KM
        </span>
        {stage.range && (
          <span className="text-foreground-muted text-sm">{stage.range}</span>
        )}
        {stage.summitFinish && (
          <span className="font-heading text-jersey-yellow tracking-wider text-sm">
            SUMMIT FINISH
          </span>
        )}
      </div>

      {stage.climbs.length > 0 && (
        <div className="mb-6">
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

      <p className="text-foreground-muted max-w-2xl leading-relaxed mb-6">
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
    </Container>
  );
}

function RestOrTransitionPanel({ next }: { next?: Stage }) {
  return (
    <Container className="text-center">
      <p className="font-heading text-jersey-yellow text-sm tracking-[0.3em] mb-4">
        TOUR DE FRANCE {TOUR_META.year}
      </p>
      <h1
        className="font-heading text-off-white leading-[0.95] mb-5"
        style={{ fontSize: "var(--text-section)" }}
      >
        REST DAY
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
 * Live mode (4–26 July). Today's stage leads; yesterday's result, the GC, and
 * the fantasy leaderboard sit as awaiting-data placeholders (manually updated
 * or API-fed). Rest days swap in a recovery panel.
 */
export function TourLiveHero() {
  const today = getTodayStage();
  const rest = isRestDay();
  const next = getNextStage();
  const yesterday = getYesterdayStage();
  const completed = getCompletedStages().map((s) => s.number);

  return (
    <>
      <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-14">
        {today && !rest ? <TodayPanel stage={today} /> : <RestOrTransitionPanel next={next} />}
      </Section>

      {/* Result / GC / Fantasy leaderboard placeholders */}
      <Section background="charcoal" className="!py-12 border-y border-white/5">
        <Container>
          <div className="grid md:grid-cols-3 gap-4">
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
            <PlaceholderCard
              eyebrow="FANTASY LEAGUE"
              title="Roadman Community Board"
              body="Once the Fantasy Tour is live, the community leaderboard lands right here."
            />
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" className="!py-12">
        <Container>
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-heading text-off-white text-2xl sm:text-3xl tracking-wide">
              THE RACE SO FAR
            </h2>
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

      <Section background="charcoal" className="!py-14">
        <Container>
          <FantasyPlaceholder />
        </Container>
      </Section>
    </>
  );
}
