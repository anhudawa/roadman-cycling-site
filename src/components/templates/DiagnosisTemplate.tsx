import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Button } from "@/components/ui";
import Link from "next/link";
import { JourneyBlock } from "@/components/journey";
import { type ContentPillar } from "@/types";
import { TemplateShell } from "./TemplateShell";
import { type EvidencePoint, type RelatedLink } from "./QuestionTemplate";

export interface DiagnosisCause {
  /** Cause name, e.g. "Chronic low-intensity bias" */
  title?: string;
  /** Body — explanation in plain language */
  body: string;
}

export interface DiagnosisFix {
  /** Fix headline, e.g. "Drop the 4x4s for two weeks" */
  title: string;
  /** Description / instructions */
  description: string;
  /** Optional internal link the visitor should follow next */
  href?: string;
}

interface DiagnosisTemplateProps {
  /** Problem name as the H1, e.g. "Why my FTP is stuck" */
  title: string;
  /** Eyebrow override. Defaults to "DIAGNOSIS" */
  eyebrow?: string;
  pillar: ContentPillar;
  /** One-paragraph problem framing — used by SpeakableSpecification */
  problem: string;
  /** Optional 1-2 sentence answer-first summary, rendered above the
   *  causes section in a .short-answer block for AI crawler extraction. */
  shortAnswer?: string;
  /** Common causes for this problem */
  causes: DiagnosisCause[];
  /** Concrete fixes / actions */
  fixes: DiagnosisFix[];
  /** Optional free tool/diagnostic CTA, e.g. /plateau */
  tool?: { href: string; label: string };
  /** Optional MDX body */
  children?: ReactNode;
  /** Evidence */
  evidence?: EvidencePoint[];
  /** Related problems */
  related?: RelatedLink[];
  /** Source string for analytics */
  source: string;
}

/**
 * DiagnosisTemplate — for /problem/[slug] pages and "why is X
 * happening" diagnostic content. Frames the problem first (so the
 * reader feels seen), surfaces the most likely causes, then prescribes
 * concrete fixes that route into tools or coaching.
 *
 * The problem paragraph keeps the `.problem-description` class so the
 * existing /problem/[slug] SpeakableSpecification continues to work
 * when this template replaces the inline implementation.
 */
export function DiagnosisTemplate({
  title,
  eyebrow = "DIAGNOSIS",
  pillar,
  problem,
  shortAnswer,
  causes,
  fixes,
  tool,
  children,
  evidence,
  related,
  source,
}: DiagnosisTemplateProps) {
  return (
    <TemplateShell
      title={title}
      eyebrow={eyebrow}
      pillar={pillar}
      heroExtras={
        <>
          <p className="problem-description text-foreground-muted text-lg leading-relaxed max-w-2xl mb-6">
            {problem}
          </p>
          {shortAnswer && (
            <section
              className="short-answer rounded-xl border border-coral/30 bg-coral/10 p-5 md:p-6 max-w-2xl"
              aria-label="Diagnosis short answer"
            >
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
                THE SHORT ANSWER
              </p>
              <p className="text-off-white text-base leading-relaxed">
                {shortAnswer}
              </p>
            </section>
          )}
        </>
      }
    >
      <Section background="charcoal">
        <Container width="narrow">
          <ScrollReveal direction="up" className="mb-8">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              WHY THIS HAPPENS
            </h2>
          </ScrollReveal>
          <div className="space-y-3">
            {causes.map((c, i) => (
              <ScrollReveal
                key={c.title ?? c.body.slice(0, 24)}
                direction="up"
                delay={i * 0.04}
              >
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-coral mt-0.5 shrink-0">✗</span>
                  <div>
                    {c.title && (
                      <p className="font-heading text-off-white text-sm tracking-wide mb-1">
                        {c.title}
                      </p>
                    )}
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="deep-purple" grain>
        <Container width="narrow">
          <ScrollReveal direction="up" className="mb-8">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              WHAT TO DO ABOUT IT
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            {fixes.map((f, i) => {
              const inner = (
                <Card
                  className="p-6 transition-all group-hover:border-coral/30"
                  hoverable={!!f.href}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center">
                      <span className="font-heading text-coral text-sm">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <h3
                        className={`font-heading text-off-white text-base mb-1 ${
                          f.href ? "group-hover:text-coral transition-colors" : ""
                        }`}
                      >
                        {f.title}
                      </h3>
                      <p className="text-foreground-muted text-sm">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
              return (
                <ScrollReveal key={f.title} direction="up" delay={i * 0.05}>
                  {f.href ? (
                    <Link href={f.href} className="block group">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {tool && (
        <Section background="charcoal" className="!py-12">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FREE DIAGNOSTIC
              </p>
              <Button
                href={tool.href}
                size="lg"
                dataTrack={`${source}_tool_cta`}
              >
                {tool.label}
              </Button>
              <div className="mt-4">
                <Link
                  href="/apply"
                  className="text-coral hover:text-coral/80 text-sm font-heading tracking-wider transition-colors"
                  data-track={`${source}_apply`}
                >
                  Or apply for coaching →
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      )}

      <Section background="charcoal">
        <Container width="narrow">
          {children && (
            <article className="prose-roadman prose-enhanced">
              {children}
            </article>
          )}

          {evidence && evidence.length > 0 && (
            <section className={children ? "mt-10" : ""}>
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
                RELATED PROBLEMS
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
        </Container>
      </Section>
    </TemplateShell>
  );
}
