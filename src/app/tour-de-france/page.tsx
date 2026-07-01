import type { Metadata } from "next";
import Link from "next/link";

import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_ORIGIN } from "@/lib/brand-facts";

import { TOUR_META, TOUR_STAGES } from "@/data/tour-de-france-2026";
import {
  getTourPhase,
  getTodayStage,
  getNextStage,
  getCompletedStages,
  daysUntilStart,
  formatStageDate,
} from "@/lib/tour";
import { getStagePodcast } from "@/data/tour-podcast";
import { TOUR_HISTORY } from "@/data/tour-history";
import { StageCard, FantasyPlaceholder, DailyPodcastCard } from "@/components/features/tour";

const URL = `${SITE_ORIGIN}/tour-de-france`;

export const metadata: Metadata = {
  title: "Tour de France 2026 — Route, Stages & The Roadman Take",
  description:
    "Every stage of the 2026 Tour de France, from the Barcelona team time trial to back-to-back Alpe d'Huez finishes — with the training principle behind each day and the Roadman Fantasy Tour.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Tour de France 2026 — Route, Stages & The Roadman Take",
    description:
      "All 21 stages of the 2026 Tour de France, with the Roadman training angle on every one.",
    type: "website",
    url: URL,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

// Keep the phase-driven status header fresh without a redeploy.
export const revalidate = 900;

const FACTS = [
  { k: "Grand Départ", v: `${TOUR_META.grandDepart} · 4 July` },
  { k: "Finish", v: "Paris · 26 July" },
  { k: "Stages", v: `${TOUR_META.stageCount}` },
  { k: "Distance", v: `${TOUR_META.totalDistanceKm.toLocaleString()} km` },
  { k: "Climbing", v: `${TOUR_META.totalClimbingM.toLocaleString()} m` },
  { k: "Highest point", v: `${TOUR_META.highestPoint.name} · ${TOUR_META.highestPoint.altitudeM}m` },
];

function StatusLine() {
  const phase = getTourPhase();
  if (phase === "countdown") {
    const d = daysUntilStart();
    return (
      <>Starts in <span className="text-jersey-yellow">{d} day{d === 1 ? "" : "s"}</span></>
    );
  }
  if (phase === "live") {
    const today = getTodayStage();
    return today ? (
      <>Live now · <span className="text-jersey-yellow">Stage {today.number} today</span></>
    ) : (
      <span className="text-jersey-yellow">Rest day</span>
    );
  }
  if (phase === "fadeout") return <span className="text-jersey-yellow">Race complete</span>;
  return <>4–26 July 2026</>;
}

export default function TourDeFranceHubPage() {
  const today = getTodayStage();
  const completed = new Set(getCompletedStages().map((s) => s.number));
  // Featured daily podcast: today's during the race, else the next one up
  // (the Grand Départ debrief before the race starts).
  const featuredStage = today ?? getNextStage() ?? TOUR_STAGES[0];
  const featuredPodcast = getStagePodcast(featuredStage.number);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `Tour de France ${TOUR_META.year}`,
          sport: "Road cycling",
          startDate: TOUR_META.startDate,
          endDate: TOUR_META.endDate,
          url: URL,
          location: [
            { "@type": "Place", name: "Barcelona, Spain" },
            { "@type": "Place", name: "Paris, France" },
          ],
          description:
            "The 2026 Tour de France — 21 stages from Barcelona to Paris across five mountain ranges.",
          subEvent: TOUR_STAGES.map((s) => ({
            "@type": "SportsEvent",
            name: `Stage ${s.number}: ${s.start} to ${s.finish}`,
            startDate: s.date,
            url: `${URL}/stage/${s.number}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Tour de France 2026", item: URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-14">
          <Container>
            <Breadcrumbs items={[{ label: "Tour de France 2026" }]} />
            <ScrollReveal direction="up">
              <p className="font-heading text-jersey-yellow text-xs sm:text-sm tracking-[0.3em] mb-4">
                {TOUR_META.edition} EDITION · <StatusLine />
              </p>
              <h1
                className="font-heading text-off-white leading-[0.9] mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                TOUR DE FRANCE
                <span className="block text-jersey-yellow">{TOUR_META.year}</span>
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed mb-8">
                Barcelona to Paris. {TOUR_META.stageCount}&nbsp;stages, five mountain
                ranges, two summit finishes on Alpe d&rsquo;Huez. Below: every stage, the climbs
                that decide it, and the training principle a Roadman rider takes from each
                one — plus the Fantasy Tour you can play with the community.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="#stages" dataTrack="tour_hub_stages">
                  Browse All Stages
                </Button>
                <Button href="/tour-de-france/history" variant="ghost" dataTrack="tour_hub_history">
                  Tour History
                </Button>
                <Button href="#fantasy" variant="ghost" dataTrack="tour_hub_fantasy">
                  The Fantasy Game
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Route facts */}
        <Section background="charcoal" className="!py-10 border-y border-white/5">
          <Container>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {FACTS.map((f) => (
                <div key={f.k}>
                  <p className="font-heading text-foreground-subtle text-[10px] tracking-[0.2em] mb-1">
                    {f.k.toUpperCase()}
                  </p>
                  <p className="font-heading text-off-white text-lg leading-tight">{f.v}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground-muted mt-6 leading-relaxed">
              Five ranges in order: {TOUR_META.ranges.join(" · ")}. Two rest days
              ({formatStageDate(TOUR_META.restDays[0])} and {formatStageDate(TOUR_META.restDays[1])}),
              one team time trial, one individual time trial.
            </p>
          </Container>
        </Section>

        {/* All stages */}
        <Section background="charcoal" id="stages">
          <Container>
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-off-white text-3xl sm:text-4xl tracking-wide mb-2">
                ALL {TOUR_META.stageCount} STAGES
              </h2>
              <p className="text-foreground-muted">
                Tap any stage for the route, the key climbs, the Roadman take, and the
                content to train for it.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {TOUR_STAGES.map((stage) => (
                <StageCard
                  key={stage.number}
                  stage={stage}
                  state={
                    stage.number === today?.number
                      ? "today"
                      : completed.has(stage.number)
                        ? "done"
                        : "default"
                  }
                />
              ))}
            </div>
          </Container>
        </Section>

        {/* Daily Tour podcast */}
        <Section background="deep-purple" grain id="podcast">
          <Container>
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
              <div>
                <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
                  THE DAILY TOUR PODCAST
                </p>
                <h2 className="font-heading text-off-white text-3xl sm:text-4xl tracking-wide mb-4">
                  A DEBRIEF EVERY RACE DAY
                </h2>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Through the three weeks, Anthony records a short daily breakdown of
                  the stage — the decisive move, the watts behind it, and what a
                  serious amateur takes to the bike from it. Each one lands on its
                  stage page the evening of the race, and the latest sits right here.
                </p>
                <ul className="space-y-2 text-sm">
                  {TOUR_STAGES.slice(0, 5).map((s) => (
                    <li key={s.number}>
                      <Link
                        href={`/tour-de-france/stage/${s.number}#podcast`}
                        className="group flex items-center gap-3 text-foreground-muted hover:text-off-white transition-colors"
                      >
                        <span className="font-heading text-jersey-yellow/80 text-xs tracking-wider w-16 shrink-0">
                          STAGE {s.number}
                        </span>
                        <span className="group-hover:text-jersey-yellow transition-colors">
                          {s.start} → {s.finish}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="#stages"
                      className="font-heading text-jersey-yellow hover:text-jersey-yellow-deep text-xs tracking-wider transition-colors"
                    >
                      ALL {TOUR_META.stageCount} DEBRIEFS →
                    </Link>
                  </li>
                </ul>
              </div>
              {featuredPodcast && <DailyPodcastCard slot={featuredPodcast} highlight />}
            </div>
          </Container>
        </Section>

        {/* Fantasy centrepiece */}
        <Section background="charcoal" grain className="!py-14">
          <Container>
            <FantasyPlaceholder />
          </Container>
        </Section>

        {/* Tour history teaser */}
        <Section background="deep-purple" grain>
          <Container>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
                  A HUNDRED YEARS OF HARD
                </p>
                <h2 className="font-heading text-off-white text-3xl sm:text-4xl tracking-wide">
                  TOUR HISTORY, THROUGH A TRAINING LENS
                </h2>
              </div>
              <Link
                href="/tour-de-france/history"
                className="font-heading text-jersey-yellow hover:text-jersey-yellow-deep text-sm tracking-wider transition-colors shrink-0 hidden sm:block"
              >
                ALL HISTORY →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TOUR_HISTORY.slice(0, 3).map((a) => (
                <Link
                  key={a.slug}
                  href={`/tour-de-france/history/${a.slug}`}
                  className="group block rounded-xl border border-white/8 hover:border-jersey-yellow/40 bg-background-elevated p-5 transition-all"
                >
                  <p className="font-heading text-jersey-yellow text-[10px] tracking-[0.25em] mb-2">
                    {a.tag.toUpperCase()}
                  </p>
                  <p className="font-heading text-off-white text-xl leading-tight group-hover:text-jersey-yellow transition-colors mb-2">
                    {a.title}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                    {a.dek}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* The Roadman angle */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
                THE ROADMAN ANGLE
              </p>
              <h2 className="font-heading text-off-white text-3xl tracking-wide mb-5">
                EVERY STAGE IS A TRAINING LESSON
              </h2>
              <div className="prose-roadman prose-enhanced">
                <p>
                  We&rsquo;re not here to recap the racing — the whole peloton&rsquo;s
                  press corps does that. We&rsquo;re here for what every Roadman listener
                  actually wants: what does each stage demand, and how do you build it?
                </p>
                <p>
                  A team time trial is a pacing-and-turn-taking exam your chaingang sits
                  every weekend. A summit finish rewards the rider who held their power
                  number instead of chasing wheels. The queen stage on Alpe d&rsquo;Huez
                  is fatigue resistance made visible — the capacity to keep producing
                  watts when you&rsquo;re already deeper than you&rsquo;ve ever been. Each
                  stage page connects the day to the science and the sessions behind it.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { label: "VO2max training", href: "/masters/vo2max" },
                  { label: "Race predictor", href: "/predict" },
                  { label: "In-ride fuelling", href: "/tools/fuelling" },
                  { label: "Recovery", href: "/topics/cycling-recovery" },
                  { label: "Training plans", href: "/topics/cycling-training-plans" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-jersey-yellow/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
