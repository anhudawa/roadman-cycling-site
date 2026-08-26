import type { Metadata } from "next";
import Link from "next/link";

import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_ORIGIN } from "@/lib/brand-facts";

import { TOUR_META, TOUR_STAGES } from "@/data/tour-de-france-2026";
import {
  getTodayStage,
  getCompletedStages,
  formatStageDate,
  tourPlace,
} from "@/lib/tour";
import { TOUR_HISTORY } from "@/data/tour-history";
import {
  formatGap,
  gcStandings,
  tourFinalResult,
} from "@/data/tour-results-2026";
import { StageCard } from "@/components/features/tour";

const URL = `${SITE_ORIGIN}/tour-de-france`;

export const metadata: Metadata = {
  title: "Tour de France 2026 Results: Winner, Final GC & Stages",
  description:
    "Tadej Pogačar won the 2026 Tour de France in 73:56:26, 6:26 ahead of Remco Evenepoel. See the final GC, jersey winners, Stage 21 result and all stages.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Tour de France 2026 Results: Winner, Final GC & Stages",
    description:
      "Verified 2026 Tour de France results, final classification, jersey winners and all 21 stages.",
    type: "website",
    url: URL,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

// Keep the evergreen result hub and stage directory reasonably fresh.
export const revalidate = 900;

const FACTS = [
  { k: "Grand Départ", v: `${TOUR_META.grandDepart} · 4 July` },
  { k: "Finish", v: "Paris · 26 July" },
  { k: "Stages", v: `${TOUR_META.stageCount}` },
  { k: "Distance raced", v: `${tourFinalResult.officialDistanceKm.toLocaleString()} km` },
  { k: "Planned climbing", v: `${TOUR_META.totalClimbingM.toLocaleString()} m` },
  { k: "Highest point", v: `${TOUR_META.highestPoint.name} · ${TOUR_META.highestPoint.altitudeM}m` },
];

export default function TourDeFranceHubPage() {
  const today = getTodayStage();
  const completed = new Set(getCompletedStages().map((s) => s.number));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "@id": `${URL}#event`,
          name: `Tour de France ${TOUR_META.year}`,
          sport: "Road cycling",
          startDate: TOUR_META.startDate,
          endDate: TOUR_META.endDate,
          eventStatus: "https://schema.org/EventCompleted",
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
          url: URL,
          location: [tourPlace("Barcelona"), tourPlace("Paris")],
          description:
            `Tadej Pogačar won the 2026 Tour de France in ${tourFinalResult.winningTime}, ${tourFinalResult.winningMargin} ahead of Remco Evenepoel.`,
          subEvent: TOUR_STAGES.map((s) => ({
            "@type": "SportsEvent",
            name: `Stage ${s.number}: ${s.start} to ${s.finish}`,
            startDate: s.date,
            endDate: s.date,
            eventStatus: "https://schema.org/EventCompleted",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: [tourPlace(s.start), tourPlace(s.finish)],
            url: `${URL}/stage/${s.number}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Who won the 2026 Tour de France?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `${tourFinalResult.winner} of ${tourFinalResult.winnerTeam} won in ${tourFinalResult.winningTime}, ${tourFinalResult.winningMargin} ahead of Remco Evenepoel. It was his fifth Tour de France title.`,
              },
            },
            {
              "@type": "Question",
              name: "What was the final podium of the 2026 Tour de France?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `Tadej Pogačar won, Remco Evenepoel was second at ${formatGap(tourFinalResult.podium[1].gapSeconds)}, and Isaac del Toro was third at ${formatGap(tourFinalResult.podium[2].gapSeconds)}.`,
              },
            },
            {
              "@type": "Question",
              name: "Who won the green, polka-dot and white jerseys at the 2026 Tour de France?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mads Pedersen won the green points jersey, Richard Carapaz won the polka-dot mountains jersey, and Isaac del Toro won the white young-rider jersey.",
              },
            },
            {
              "@type": "Question",
              name: "Who won Stage 21 of the 2026 Tour de France?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `${tourFinalResult.finalStage.winner} won Stage 21 in Paris ahead of ${tourFinalResult.finalStage.runnerUp} and ${tourFinalResult.finalStage.third}.`,
              },
            },
          ],
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
                {TOUR_META.edition} EDITION · FINAL RESULT · REVIEWED {tourFinalResult.lastReviewed}
              </p>
              <h1
                className="font-heading text-off-white leading-[0.9] mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                TOUR DE FRANCE
                <span className="block text-jersey-yellow">{TOUR_META.year}</span>
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed mb-8">
                <strong className="text-off-white">{tourFinalResult.winner}</strong> won
                the 2026 Tour de France in {tourFinalResult.winningTime}, finishing{" "}
                {tourFinalResult.winningMargin} ahead of Remco Evenepoel and claiming a
                record-equalling fifth title. Below: the verified final classification,
                jersey winners and every stage.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="#results" dataTrack="tour_hub_results">
                  See Final Results
                </Button>
                <Button href="#stages" variant="ghost" dataTrack="tour_hub_stages">
                  Browse All Stages
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Verified final results */}
        <Section background="charcoal" id="results" className="border-b border-white/5">
          <Container>
            <div className="max-w-3xl mb-10">
              <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
                OFFICIAL RESULT · REVIEWED {tourFinalResult.lastReviewed}
              </p>
              <h2 className="font-heading text-off-white text-3xl sm:text-4xl tracking-wide mb-4">
                2026 TOUR DE FRANCE FINAL RESULTS
              </h2>
              <p className="text-off-white text-lg leading-relaxed">
                <strong>{tourFinalResult.winner}</strong> of {tourFinalResult.winnerTeam}
                won in {tourFinalResult.winningTime}. Remco Evenepoel finished second at{" "}
                {tourFinalResult.winningMargin}, with Isaac del Toro third at{" "}
                {formatGap(tourFinalResult.podium[2].gapSeconds)}. It was Pogačar&rsquo;s fifth Tour
                victory, equalling the all-time record.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.04]">
                    <tr className="text-foreground-subtle text-xs tracking-wider">
                      <th className="px-4 py-3">GC</th>
                      <th className="px-4 py-3">RIDER</th>
                      <th className="px-4 py-3">TEAM</th>
                      <th className="px-4 py-3 text-right">TIME / GAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gcStandings.map((rider) => (
                      <tr key={rider.position} className="border-t border-white/8 text-sm">
                        <td className="px-4 py-3 font-heading text-jersey-yellow">
                          {rider.position}
                        </td>
                        <td className="px-4 py-3 text-off-white font-medium">
                          {rider.name}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">{rider.team}</td>
                        <td className="px-4 py-3 text-off-white text-right tabular-nums">
                          {rider.position === 1
                            ? tourFinalResult.winningTime
                            : formatGap(rider.gapSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <h3 className="font-heading text-off-white text-2xl tracking-wide mb-4">
                  CLASSIFICATION WINNERS
                </h3>
                {tourFinalResult.classificationWinners.map((item) => (
                  <div key={item.classification} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-heading text-foreground-subtle text-[10px] tracking-[0.2em] mb-1">
                      {item.classification.toUpperCase()}
                    </p>
                    <p className="text-off-white font-medium">{item.winner}</p>
                    {item.team && <p className="text-foreground-muted text-sm">{item.team}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              <div className="rounded-xl border-l-2 border-jersey-yellow bg-white/[0.03] p-5">
                <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-2">
                  STAGE 21 · PARIS
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {tourFinalResult.finalStage.summary}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-3">
                  PRIMARY SOURCES
                </p>
                <ul className="space-y-2">
                  {tourFinalResult.sources.map((source) => (
                    <li key={source.href}>
                      <a href={source.href} className="text-jersey-yellow hover:text-jersey-yellow-deep underline underline-offset-4 text-sm">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
            <p className="text-sm text-foreground-muted mt-3 leading-relaxed">
              For the route through an amateur-training lens, read the{" "}
              <Link href="/blog/tour-de-france-2026-route-what-it-means-for-you" className="text-jersey-yellow hover:text-jersey-yellow-deep underline underline-offset-4">
                2026 route and training analysis
              </Link>
              . For the winner&rsquo;s build-up, use the distinct{" "}
              <Link href="/blog/tdf-2026-contenders-preparation-lessons" className="text-jersey-yellow hover:text-jersey-yellow-deep underline underline-offset-4">
                Pogačar preparation record
              </Link>
              .
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
