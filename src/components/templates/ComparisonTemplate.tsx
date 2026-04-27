import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JourneyBlock } from "@/components/journey";
import { NextStepBlock } from "@/components/features/conversion/NextStepBlock";
import { type ContentPillar } from "@/types";
import { TemplateShell } from "./TemplateShell";
import { type EvidencePoint, type RelatedLink } from "./QuestionTemplate";

export interface ComparisonRow {
  /** Feature / dimension being compared */
  feature: string;
  /** Value for option A */
  optionA: string;
  /** Value for option B */
  optionB: string;
}

interface ComparisonTemplateProps {
  /** First option name, e.g. "Polarised" */
  optionA: string;
  /** Second option name, e.g. "Sweet Spot" */
  optionB: string;
  pillar: ContentPillar;
  /** Quick verdict — answer-first, used as the AI-citation chunk */
  verdict: string;
  /** Side-by-side feature rows */
  rows: ComparisonRow[];
  /** Bullet list — when option A is the right pick */
  bestForA: string[];
  /** Bullet list — when option B is the right pick */
  bestForB: string[];
  /** Optional body content under the verdict (e.g. MDX explanation) */
  children?: ReactNode;
  /** Optional evidence/citation list */
  evidence?: EvidencePoint[];
  /** Related comparisons / topic links */
  related?: RelatedLink[];
  /** Source string for analytics */
  source: string;
}

/**
 * ComparisonTemplate — verdict-first layout for /compare and "X vs Y"
 * blog content. The verdict block is marked with `.verdict-block` so
 * existing schema.org SpeakableSpecification on /compare/[slug] keeps
 * working when this template is dropped in.
 *
 * Structure:
 *   1. Hero — "A VS B" H1
 *   2. Verdict block — answer-first
 *   3. Side-by-side comparison table (desktop) / stacked rows (mobile)
 *   4. "Choose A if" / "Choose B if" decision blocks
 *   5. Optional body content (MDX)
 *   6. Evidence
 *   7. Related comparisons
 *   8. JourneyBlock (decision stage) → NextStepBlock
 */
export function ComparisonTemplate({
  optionA,
  optionB,
  pillar,
  verdict,
  rows,
  bestForA,
  bestForB,
  children,
  evidence,
  related,
  source,
}: ComparisonTemplateProps) {
  return (
    <TemplateShell
      title={`${optionA} vs ${optionB}`}
      eyebrow="COMPARISON"
      pillar={pillar}
      heroExtras={
        <section
          className="short-answer verdict-block rounded-xl border border-coral/30 bg-coral/10 p-5 md:p-6 mt-6"
          aria-label="Comparison verdict"
        >
          <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
            QUICK VERDICT
          </p>
          <p className="text-off-white text-base leading-relaxed">{verdict}</p>
        </section>
      }
    >
      <Section background="charcoal">
        <Container width="narrow">
          <ScrollReveal direction="up" className="mb-8 text-center">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              SIDE BY SIDE
            </h2>
          </ScrollReveal>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-foreground-subtle font-heading text-xs tracking-widest">
                    FEATURE
                  </th>
                  <th className="text-left py-3 px-4 text-coral font-heading text-xs tracking-widest">
                    {optionA.toUpperCase()}
                  </th>
                  <th className="text-left py-3 px-4 text-foreground-subtle font-heading text-xs tracking-widest">
                    {optionB.toUpperCase()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-white/5">
                    <td className="py-3 px-4 text-off-white font-medium">
                      {r.feature}
                    </td>
                    <td className="py-3 px-4 text-foreground-muted">
                      {r.optionA}
                    </td>
                    <td className="py-3 px-4 text-foreground-muted">
                      {r.optionB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" grain>
        <Container width="narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScrollReveal direction="up">
              <Card className="p-6 h-full" hoverable={false}>
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  CHOOSE {optionA.toUpperCase()} IF
                </p>
                <ul className="space-y-2">
                  {bestForA.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-foreground-muted text-sm"
                    >
                      <span className="text-coral mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <Card className="p-6 h-full" hoverable={false}>
                <p className="font-heading text-foreground-subtle text-xs tracking-widest mb-3">
                  CHOOSE {optionB.toUpperCase()} IF
                </p>
                <ul className="space-y-2">
                  {bestForB.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-foreground-muted text-sm"
                    >
                      <span className="text-foreground-subtle mt-0.5 shrink-0">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      <Section background="charcoal">
        <Container width="narrow">
          {children && (
            <article className="prose-roadman prose-enhanced">
              {children}
            </article>
          )}

            {evidence && evidence.length > 0 && (
              <section className="mt-10">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  EVIDENCE
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
                  RELATED COMPARISONS
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

          <JourneyBlock
            stage="decision"
            pillar={pillar}
            source={source}
            className={children || evidence || related ? "mt-12" : ""}
          />

          <NextStepBlock pillar={pillar} source={`${source}-next`} />
        </Container>
      </Section>
    </TemplateShell>
  );
}
