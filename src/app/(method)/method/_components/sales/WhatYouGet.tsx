import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { SYLLABUS } from "./data";
import { PILLAR_STYLES, PILLAR_LABEL } from "./pillarStyles";

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="py-24 md:py-32 border-t border-white/5 relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-coral/20 to-transparent"
      />
      <Container width="wide">
        <div className="mb-20 max-w-[820px]">
          <Reveal>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
              THE 12-WEEK SYLLABUS
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)]">
              Every week, opened up.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 text-lg text-foreground-muted leading-relaxed">
              Every module includes a video lesson with Anthony, a written companion guide
              you can read on the train, downloadable templates and protocol cards, and —
              for Premium members — a TrainingPeaks plan that reflects exactly what you
              learned that week.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-4 md:gap-5">
          {SYLLABUS.map((week, i) => {
            const style = PILLAR_STYLES[week.pillar];
            return (
              <Reveal key={week.week} delay={i < 4 ? 60 * i : 0} as="li">
                <article
                  className="group grid gap-6 md:grid-cols-[140px_1fr_auto] md:gap-10 p-6 md:p-8 rounded-sm border border-white/5 bg-[color:var(--color-elevated)]/40 hover:bg-[color:var(--color-elevated)] hover:border-white/10 transition-all"
                >
                  <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-2">
                    <span className="font-heading text-xs tracking-[0.3em] text-foreground-muted">
                      WEEK
                    </span>
                    <span
                      className="font-heading text-5xl md:text-6xl text-off-white leading-none"
                      style={{ color: `var(${style.cssVar})` }}
                    >
                      {String(week.week).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <p
                      className={`font-heading text-xs tracking-[0.3em] ${style.text} mb-2 uppercase`}
                    >
                      Pillar — {PILLAR_LABEL[week.pillar]}
                    </p>
                    <h3 className="font-heading uppercase text-2xl md:text-3xl text-off-white leading-tight mb-4">
                      {week.title}
                    </h3>
                    <p className="text-sm md:text-base text-foreground-muted leading-relaxed mb-4">
                      <span className="text-coral font-medium">The problem: </span>
                      {week.problem}
                    </p>
                    <p className="text-sm md:text-base text-off-white/90 leading-relaxed">
                      <span className="text-coral font-medium">What you&apos;ll do: </span>
                      {week.promise}
                    </p>
                  </div>

                  <ul className="flex flex-wrap md:flex-col md:justify-center gap-2 md:gap-2.5 md:w-[180px]">
                    <Tag>{week.videoMinutes}-min video</Tag>
                    <Tag>Written guide</Tag>
                    <Tag>Worksheet + templates</Tag>
                    {week.hasTrainingPeaks ? (
                      <Tag accent>TrainingPeaks plan</Tag>
                    ) : null}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={120}>
          <p className="mt-16 text-center text-sm text-foreground-muted">
            Plus — Entry & Exit Assessment frameworks, the Roadman Session Library, and a
            single-page summary of the entire Method to keep on the bike.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function Tag({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <li
      className={`text-xs font-heading uppercase tracking-wider px-3 py-1.5 rounded-sm ${
        accent
          ? "bg-coral/15 text-coral border border-coral/30"
          : "bg-white/5 text-foreground-muted border border-white/5"
      }`}
    >
      {children}
    </li>
  );
}
