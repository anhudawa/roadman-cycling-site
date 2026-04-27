import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JourneyBlock } from "@/components/journey";
import { NextStepBlock } from "@/components/features/conversion/NextStepBlock";
import { type ContentPillar } from "@/types";
import { TemplateShell } from "./TemplateShell";
import { type EvidencePoint, type RelatedLink } from "./QuestionTemplate";

export interface ProtocolStep {
  /** Short title, e.g. "Set 1 — 2x20min @ 88% FTP" */
  title: string;
  /** Step body — instructions, rationale */
  body: string;
  /** Optional duration label, e.g. "Week 1-3" */
  duration?: string;
}

export interface ProtocolKeyVar {
  /** What to track, e.g. "FTP", "Total weekly hours" */
  label: string;
  /** Target / range / definition */
  value: string;
  /** Optional clarification */
  note?: string;
}

interface ProtocolTemplateProps {
  /** The protocol name, e.g. "Sweet-Spot Build Protocol" */
  title: string;
  /** Subtitle / context */
  subtitle?: string;
  pillar: ContentPillar;
  /** Eyebrow override. Defaults to "PROTOCOL" */
  eyebrow?: string;
  /** Single-line summary — the answer-first chunk */
  summary: string;
  /** Steps in order (1..n) — rendered as numbered cards */
  steps: ProtocolStep[];
  /** Key variables / dosing parameters — rendered as a stat grid */
  keyVars?: ProtocolKeyVar[];
  /** Optional body content (MDX) */
  children?: ReactNode;
  /** Evidence list */
  evidence?: EvidencePoint[];
  /** Related protocols */
  related?: RelatedLink[];
  /** Source string for analytics */
  source: string;
}

/**
 * ProtocolTemplate — for prescriptive how-to-do-this content. Sweet-spot
 * blocks, polarised week templates, race-week tapers, fueling protocols,
 * S&C cycles. Lead with a one-line summary, then numbered steps and
 * key variables, then evidence + journey.
 *
 * The structure mirrors how a coach explains a protocol verbally:
 * what you're doing → exact dosing → why → what to do next.
 */
export function ProtocolTemplate({
  title,
  subtitle,
  pillar,
  eyebrow = "PROTOCOL",
  summary,
  steps,
  keyVars,
  children,
  evidence,
  related,
  source,
}: ProtocolTemplateProps) {
  return (
    <TemplateShell
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      pillar={pillar}
      heroExtras={
        <div className="protocol-summary rounded-xl border border-coral/30 bg-coral/10 p-5 md:p-6">
          <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
            HOW IT WORKS
          </p>
          <p className="text-off-white text-base leading-relaxed">{summary}</p>
        </div>
      }
    >
      {keyVars && keyVars.length > 0 && (
        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-4">
              KEY VARIABLES
            </p>
            <div
              className={`grid gap-3 ${
                keyVars.length >= 3
                  ? "sm:grid-cols-2 md:grid-cols-3"
                  : "sm:grid-cols-2"
              }`}
            >
              {keyVars.map((v) => (
                <div
                  key={v.label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-[11px] font-heading tracking-widest text-foreground-subtle uppercase mb-2">
                    {v.label}
                  </p>
                  <p className="font-heading text-coral text-lg leading-tight">
                    {v.value}
                  </p>
                  {v.note && (
                    <p className="text-[11px] text-foreground-subtle mt-1.5 leading-snug">
                      {v.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section background="deep-purple" grain>
        <Container width="narrow">
          <ScrollReveal direction="up" className="mb-8">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              THE PROTOCOL
            </h2>
          </ScrollReveal>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <ScrollReveal key={s.title} direction="up" delay={i * 0.04}>
                <li>
                  <Card className="p-6" hoverable={false}>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                        <span className="font-heading text-coral text-base">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-2 mb-2">
                          <h3 className="font-heading text-off-white text-lg leading-snug">
                            {s.title}
                          </h3>
                          {s.duration && (
                            <span className="text-coral text-xs font-heading tracking-widest uppercase">
                              {s.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </Card>
                </li>
              </ScrollReveal>
            ))}
          </ol>
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
                  WHY THIS WORKS
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
                  RELATED PROTOCOLS
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
            stage="awareness"
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
