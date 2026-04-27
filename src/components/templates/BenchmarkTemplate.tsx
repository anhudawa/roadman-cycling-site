import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JourneyBlock } from "@/components/journey";
import { NextStepBlock } from "@/components/features/conversion/NextStepBlock";
import { type ContentPillar } from "@/types";
import { TemplateShell } from "./TemplateShell";
import { type EvidencePoint, type RelatedLink } from "./QuestionTemplate";

export interface BenchmarkBand {
  /** Band label, e.g. "Cat 4 / Sportive rider", "Age 50+ Untrained" */
  label: string;
  /** Range or specific value, e.g. "2.5 - 3.0 W/kg" */
  value: string;
  /** Optional supporting note */
  note?: string;
}

export interface BenchmarkGroup {
  /** Group title, e.g. "Men 30-39", "Time-trial specialists" */
  title: string;
  /** Optional intro line */
  description?: string;
  bands: BenchmarkBand[];
}

interface BenchmarkTemplateProps {
  /** Page title, e.g. "Age-group FTP benchmarks" */
  title: string;
  /** Subtitle / context line */
  subtitle?: string;
  pillar: ContentPillar;
  /** Eyebrow override. Defaults to "BENCHMARK" */
  eyebrow?: string;
  /** Single-line answer summary, used for AI Overview / SGE */
  answerLine: string;
  /** Benchmark groups — typically 2-4. Each renders as a card with bands. */
  groups: BenchmarkGroup[];
  /** Optional source/methodology body */
  children?: ReactNode;
  /** Evidence list */
  evidence?: EvidencePoint[];
  /** Related benchmark / topic links */
  related?: RelatedLink[];
  /** Source string for analytics */
  source: string;
}

/**
 * BenchmarkTemplate — for "Age-group FTP", "Best gravel bikes",
 * "Power-to-weight thresholds" style benchmark / ranking pages.
 *
 * Lead with a single-line answer (the band the visitor probably
 * landed for), then a groups grid of band tables. Pair with the
 * tool-stage JourneyBlock so visitors can immediately apply the
 * benchmark to their own numbers.
 */
export function BenchmarkTemplate({
  title,
  subtitle,
  pillar,
  eyebrow = "BENCHMARK",
  answerLine,
  groups,
  children,
  evidence,
  related,
  source,
}: BenchmarkTemplateProps) {
  return (
    <TemplateShell
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      pillar={pillar}
      heroExtras={
        <div className="benchmark-answer rounded-xl border border-coral/30 bg-coral/10 p-5 md:p-6">
          <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
            ANSWER
          </p>
          <p className="text-off-white text-base leading-relaxed">
            {answerLine}
          </p>
        </div>
      }
    >
      <Section background="charcoal">
        <Container width="narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {groups.map((g, i) => (
              <ScrollReveal key={g.title} direction="up" delay={i * 0.05}>
                <Card className="p-6 h-full" hoverable={false}>
                  <h2 className="font-heading text-off-white text-lg tracking-wide mb-1">
                    {g.title.toUpperCase()}
                  </h2>
                  {g.description && (
                    <p className="text-foreground-muted text-sm mb-4">
                      {g.description}
                    </p>
                  )}
                  <ul className="space-y-2 mt-3">
                    {g.bands.map((b) => (
                      <li
                        key={b.label}
                        className="flex items-baseline justify-between gap-3 border-b border-white/5 last:border-b-0 py-2"
                      >
                        <span className="text-foreground-muted text-sm">
                          {b.label}
                        </span>
                        <span className="font-heading text-coral text-sm tracking-wider shrink-0">
                          {b.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      {(children || evidence || related) && (
        <Section background="deep-purple" grain>
          <Container width="narrow">
            {children && (
              <article className="prose-roadman prose-enhanced">
                {children}
              </article>
            )}

            {evidence && evidence.length > 0 && (
              <section className="mt-10">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  HOW THESE NUMBERS WERE BUILT
                </p>
                <ul className="space-y-3">
                  {evidence.map((e) => (
                    <li
                      key={`${e.label}-${e.detail.slice(0, 24)}`}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                    >
                      {e.href ? (
                        <a
                          href={e.href}
                          target={
                            e.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            e.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="font-heading text-off-white hover:text-coral transition-colors"
                        >
                          {e.label}
                        </a>
                      ) : (
                        <span className="font-heading text-off-white">
                          {e.label}
                        </span>
                      )}
                      <p className="text-foreground-muted text-sm mt-1.5 leading-relaxed">
                        {e.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {related && related.length > 0 && (
              <section className="mt-10">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  RELATED BENCHMARKS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {related.map((r) => (
                    <Card key={r.href} href={r.href} className="p-4 h-full">
                      <p className="font-heading text-off-white text-sm leading-snug group-hover:text-coral transition-colors">
                        {r.label}
                      </p>
                      {r.description && (
                        <p className="text-foreground-subtle text-xs mt-1.5 leading-snug">
                          {r.description}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </Container>
        </Section>
      )}

      <Section background="charcoal" className="!py-12">
        <Container width="narrow">
          <JourneyBlock stage="tool" pillar={pillar} source={source} />
          <NextStepBlock pillar={pillar} source={`${source}-next`} />
        </Container>
      </Section>
    </TemplateShell>
  );
}
