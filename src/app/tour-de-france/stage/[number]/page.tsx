import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_ORIGIN } from "@/lib/brand-facts";

import {
  TOUR_STAGES,
  TOUR_META,
  TOUR_TYPE_LABEL,
  getStage,
} from "@/data/tour-de-france-2026";
import { formatStageDate, tourPlace } from "@/lib/tour";
import { StageTypeIcon, STAGE_TYPE_COLOR } from "@/components/features/tour";

export function generateStaticParams() {
  return TOUR_STAGES.map((s) => ({ number: String(s.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const stage = getStage(Number(number));
  if (!stage) return { title: "Stage Not Found" };

  const url = `${SITE_ORIGIN}/tour-de-france/stage/${stage.number}`;
  const title = stage.result
    ? `Tour de France 2026 Stage ${stage.number} Results: ${stage.result.winner.split(" ").at(-1)} Wins`
    : `Stage ${stage.number}: ${stage.start} → ${stage.finish} — Tour de France 2026`;
  const description = stage.result
    ? `${stage.result.winner} won Tour de France 2026 stage ${stage.number} in ${stage.result.winningTime}. See the podium, time gaps, race story and official sources.`
    : `${TOUR_TYPE_LABEL[stage.type]} · ${stage.distanceKm}km. ${stage.description}`;
  return {
    title,
    description: description.slice(0, 200),
    alternates: { canonical: url },
    openGraph: {
      title,
      description: description.slice(0, 200),
      type: "article",
      url,
      images: ["/og-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function StagePage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const n = Number(number);
  const stage = getStage(n);
  if (!stage || !Number.isInteger(n)) notFound();

  const url = `${SITE_ORIGIN}/tour-de-france/stage/${stage.number}`;
  const color = STAGE_TYPE_COLOR[stage.type];
  const prev = getStage(stage.number - 1);
  const next = getStage(stage.number + 1);
  const result = stage.result;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "@id": `${url}#event`,
          name: `Tour de France 2026 — Stage ${stage.number}: ${stage.start} to ${stage.finish}`,
          sport: "Road cycling",
          startDate: stage.date,
          endDate: stage.date,
          eventStatus: "https://schema.org/EventCompleted",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          url,
          location: [tourPlace(stage.start), tourPlace(stage.finish)],
          description: result?.summary ?? stage.description,
        }}
      />
      {result && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Who won stage ${stage.number} of the 2026 Tour de France?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${result.winner} of ${result.winnerTeam} won in ${result.winningTime}.`,
                },
              },
              {
                "@type": "Question",
                name: `What was the stage ${stage.number} podium?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: result.podium
                    .map(
                      (rider) =>
                        `${rider.position}. ${rider.rider} (${rider.timeOrGap})`,
                    )
                    .join("; "),
                },
              },
              {
                "@type": "Question",
                name: `How did ${result.winner} win stage ${stage.number}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: result.summary,
                },
              },
            ],
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Tour de France 2026",
              item: `${SITE_ORIGIN}/tour-de-france`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: `Stage ${stage.number}`,
              item: url,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section
          background="deep-purple"
          grain
          className="pt-28 sm:pt-32 pb-12"
        >
          <Container>
            <Breadcrumbs
              items={[
                { label: "Tour de France 2026", href: "/tour-de-france" },
                { label: `Stage ${stage.number}` },
              ]}
            />
            <ScrollReveal direction="up">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-heading text-jersey-yellow text-sm tracking-[0.25em]">
                  STAGE {stage.number} OF {TOUR_META.stageCount}
                </span>
                <span className="text-foreground-subtle text-sm">
                  {formatStageDate(stage.date)}
                </span>
              </div>
              <h1
                className="font-heading text-off-white leading-[0.92] mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {stage.start}
                <span className="text-jersey-yellow"> → </span>
                {stage.finish}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span
                  className="inline-flex items-center gap-2 font-heading tracking-wider text-lg"
                  style={{ color }}
                >
                  <StageTypeIcon type={stage.type} className="w-6 h-6" />
                  {TOUR_TYPE_LABEL[stage.type]}
                </span>
                <span className="text-off-white font-heading text-xl tabular-nums">
                  {stage.distanceKm} KM
                </span>
                {stage.elevationGainM && (
                  <span className="text-off-white font-heading text-xl tabular-nums">
                    {stage.elevationGainM.toLocaleString()} M CLIMBING
                  </span>
                )}
                {stage.range && (
                  <span className="text-foreground-muted">{stage.range}</span>
                )}
                {stage.summitFinish && (
                  <span className="font-heading text-jersey-yellow tracking-wider">
                    SUMMIT FINISH
                  </span>
                )}
                {stage.sprintFriendly && (
                  <span
                    className="font-heading tracking-wider"
                    style={{ color: STAGE_TYPE_COLOR.flat }}
                  >
                    SPRINT FINISH LIKELY
                  </span>
                )}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Stage overview */}
        <Section
          background="charcoal"
          className="!py-12 border-b border-white/5"
        >
          <Container width="narrow">
            <p className="text-off-white text-lg leading-relaxed">
              {stage.description}
            </p>
          </Container>
        </Section>

        {/* Verified post-race result */}
        {result && (
          <Section
            background="charcoal"
            className="!py-12 border-b border-white/5"
          >
            <Container width="narrow">
              <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
                VERIFIED RESULT · REVIEWED {result.lastReviewed}
              </p>
              <h2 className="font-heading text-off-white text-3xl tracking-wide mb-3">
                STAGE {stage.number} RESULT
              </h2>
              <p className="text-off-white text-lg leading-relaxed mb-7">
                <strong>{result.winner}</strong> of {result.winnerTeam} won in{" "}
                {result.winningTime}. The official result and report, rather
                than Roadman&apos;s pre-race prediction, now control this page.
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10 mb-8">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.04]">
                    <tr className="text-foreground-subtle text-xs tracking-wider">
                      <th className="px-4 py-3">PLACE</th>
                      <th className="px-4 py-3">RIDER</th>
                      <th className="px-4 py-3">TEAM</th>
                      <th className="px-4 py-3 text-right">TIME / GAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.podium.map((rider) => (
                      <tr
                        key={rider.position}
                        className="border-t border-white/8 text-sm"
                      >
                        <td className="px-4 py-3 font-heading text-jersey-yellow">
                          {rider.position}
                        </td>
                        <td className="px-4 py-3 text-off-white font-medium">
                          {rider.rider}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {rider.team}
                        </td>
                        <td className="px-4 py-3 text-off-white text-right tabular-nums">
                          {rider.timeOrGap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-heading text-off-white text-2xl tracking-wide mb-3">
                HOW THE RACE WAS WON
              </h3>
              <p className="text-foreground-muted leading-relaxed mb-6">
                {result.summary}
              </p>
              <ol className="space-y-3 mb-8">
                {result.keyMoments.map((moment, index) => (
                  <li
                    key={moment}
                    className="flex gap-3 text-foreground-muted leading-relaxed"
                  >
                    <span className="font-heading text-jersey-yellow shrink-0">
                      {index + 1}.
                    </span>
                    <span>{moment}</span>
                  </li>
                ))}
              </ol>

              <div className="rounded-xl border-l-2 border-jersey-yellow bg-white/[0.03] p-5 mb-8">
                <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-2">
                  GENERAL CLASSIFICATION AFTER STAGE {stage.number}
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {result.classificationAfter}
                </p>
              </div>

              <h3 className="font-heading text-off-white text-xl tracking-wide mb-3">
                OFFICIAL SOURCES
              </h3>
              <ul className="space-y-2">
                {result.sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      className="text-jersey-yellow hover:text-jersey-yellow-deep underline underline-offset-4"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        )}

        {/* Key climbs */}
        {stage.climbs.length > 0 && (
          <Section
            background="charcoal"
            className="!py-12 border-b border-white/5"
          >
            <Container width="narrow">
              <h2 className="font-heading text-off-white text-2xl tracking-wide mb-6">
                KEY CLIMBS
              </h2>
              <div className="space-y-3">
                {stage.climbs.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-4 rounded-xl border border-white/8 bg-background-elevated p-4"
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-heading text-sm"
                      style={{ color, backgroundColor: `${color}1F` }}
                    >
                      {c.category
                        ? c.category === "HC"
                          ? "HC"
                          : `C${c.category}`
                        : "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-off-white text-lg leading-tight">
                        {c.name}
                      </p>
                      <p className="text-sm text-foreground-muted tabular-nums">
                        {[
                          c.lengthKm != null ? `${c.lengthKm} km` : null,
                          c.gradientPct != null
                            ? `${c.gradientPct}% avg`
                            : null,
                          c.summitM != null
                            ? `${c.summitM.toLocaleString()} m summit`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Categorised climb"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* The tactical read — previews only; verified results replace predictions. */}
        {!result && (
          <Section
            background="charcoal"
            className="!py-12 border-b border-white/5"
          >
            <Container width="narrow">
              <h2 className="font-heading text-off-white text-2xl tracking-wide mb-6">
                THE TACTICAL READ
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-2">
                    WHO IT SUITS
                  </p>
                  <p className="text-off-white leading-relaxed">
                    {stage.tactical.whoBenefits}
                  </p>
                </div>
                <div>
                  <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-2">
                    WHAT TO WATCH
                  </p>
                  <p className="text-off-white leading-relaxed">
                    {stage.tactical.whatToWatch}
                  </p>
                </div>
                <div className="rounded-xl border-l-2 border-jersey-yellow bg-white/[0.03] p-5">
                  <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-2">
                    ROADMAN PREDICTION
                  </p>
                  <p className="text-foreground-muted leading-relaxed">
                    {stage.prediction}
                  </p>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* The Roadman take */}
        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow">
            <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.3em] mb-3">
              THE ROADMAN TAKE
            </p>
            <h2 className="font-heading text-off-white text-3xl tracking-wide mb-5">
              {result ? "WHAT THE RESULT SHOWS" : "WHAT THIS STAGE DEMANDS"}
            </h2>
            <p className="text-off-white text-lg leading-relaxed mb-8">
              {stage.roadmanTake}
            </p>

            {!result && (
              <div className="rounded-xl border-l-2 border-jersey-yellow bg-white/[0.03] p-5">
                <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-2">
                  WHAT {stage.expertAngle.expert.toUpperCase()} WOULD PUSH
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {stage.expertAngle.angle}
                </p>
              </div>
            )}
          </Container>
        </Section>

        {/* Train for it — related content */}
        {stage.related.length > 0 && (
          <Section background="charcoal" className="!py-12">
            <Container width="narrow">
              <h2 className="font-heading text-off-white text-2xl tracking-wide mb-2">
                TRAIN FOR IT
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                The Roadman content that builds what Stage {stage.number} asks
                for.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {stage.related.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/8 hover:border-jersey-yellow/40 bg-background-elevated p-4 transition-all"
                  >
                    <span className="font-heading text-off-white group-hover:text-jersey-yellow transition-colors tracking-wide">
                      {r.label}
                    </span>
                    <span className="text-jersey-yellow shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Prev / next */}
        <Section background="charcoal" className="!py-10">
          <Container>
            <div className="flex items-stretch justify-between gap-3">
              {prev ? (
                <Link
                  href={`/tour-de-france/stage/${prev.number}`}
                  className="group flex-1 rounded-xl border border-white/8 hover:border-white/25 bg-background-elevated p-4 transition-all"
                >
                  <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-1">
                    ← STAGE {prev.number}
                  </p>
                  <p className="font-heading text-off-white group-hover:text-jersey-yellow transition-colors leading-tight">
                    {prev.start} → {prev.finish}
                  </p>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <Link
                  href={`/tour-de-france/stage/${next.number}`}
                  className="group flex-1 rounded-xl border border-white/8 hover:border-white/25 bg-background-elevated p-4 transition-all text-right"
                >
                  <p className="font-heading text-foreground-subtle text-[11px] tracking-[0.25em] mb-1">
                    STAGE {next.number} →
                  </p>
                  <p className="font-heading text-off-white group-hover:text-jersey-yellow transition-colors leading-tight">
                    {next.start} → {next.finish}
                  </p>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/tour-de-france"
                className="font-heading text-jersey-yellow hover:text-jersey-yellow-deep text-sm tracking-wider transition-colors"
              >
                ← ALL {TOUR_META.stageCount} STAGES
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
