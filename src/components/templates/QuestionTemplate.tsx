import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { JourneyBlock } from "@/components/journey";
import { NextStepBlock } from "@/components/features/conversion/NextStepBlock";
import { type ContentPillar } from "@/types";
import { TemplateShell } from "./TemplateShell";

export interface EvidencePoint {
  /** Short label, e.g. "Seiler 2010" */
  label: string;
  /** What the evidence shows in plain language */
  detail: string;
  /** Optional href to the source — internal page or external link */
  href?: string;
}

export interface RelatedLink {
  label: string;
  href: string;
  /** Optional sub-line description */
  description?: string;
}

interface QuestionTemplateProps {
  /** The question itself, used as the H1, e.g. "How long is the FTP test?" */
  question: string;
  /** The 60-100 word answer. Renders inside AnswerCapsule for AI citation. */
  answer: string;
  pillar: ContentPillar;
  /** Optional eyebrow — defaults to "QUESTION" */
  eyebrow?: string;
  /** Body — usually MDX content, headings, etc. Optional if the answer alone is enough. */
  children?: ReactNode;
  /** Evidence points, citations, episode references */
  evidence?: EvidencePoint[];
  /** Related questions / topic links */
  related?: RelatedLink[];
  /** Source string for analytics */
  source: string;
}

/**
 * QuestionTemplate — answer-first layout for /blog Q&A pages and
 * standalone question routes. Optimised for AI Overview / SGE citations
 * by leading with a single declarative answer in the AnswerCapsule
 * (which is referenced by the schema.org SpeakableSpecification on the
 * BlogPosting JSON-LD).
 *
 * Structure:
 *   1. Hero — question as H1
 *   2. AnswerCapsule — single-paragraph TL;DR
 *   3. Body content (children) — full explanation, MDX-rendered usually
 *   4. Evidence — named experts, studies, episodes
 *   5. Related questions — lateral browse
 *   6. JourneyBlock — funnel-aware next steps (awareness stage)
 *   7. NextStepBlock — final apply/community/read-next CTA
 */
export function QuestionTemplate({
  question,
  answer,
  pillar,
  eyebrow = "QUESTION",
  children,
  evidence,
  related,
  source,
}: QuestionTemplateProps) {
  return (
    <TemplateShell title={question} eyebrow={eyebrow} pillar={pillar}>
      <Section background="charcoal" className="!py-12">
        <Container width="narrow">
          <AnswerCapsule text={answer} pillar={pillar} />

          {children && (
            <article className="prose-roadman prose-enhanced">
              {children}
            </article>
          )}

          {evidence && evidence.length > 0 && (
            <section className="mt-12" aria-labelledby={`evidence-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                EVIDENCE
              </p>
              <h2
                id={`evidence-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                WHERE THIS COMES FROM
              </h2>
              <ul className="space-y-3">
                {evidence.map((e) => (
                  <li
                    key={`${e.label}-${e.detail.slice(0, 24)}`}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
                    {e.href ? (
                      <a
                        href={e.href}
                        target={e.href.startsWith("http") ? "_blank" : undefined}
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
            <section className="mt-12">
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                RELATED QUESTIONS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <ScrollReveal key={r.href} direction="up">
                    <Card className="p-4 h-full" hoverable href={r.href}>
                      <p className="font-heading text-off-white text-sm leading-snug group-hover:text-coral transition-colors">
                        {r.label}
                      </p>
                      {r.description && (
                        <p className="text-foreground-subtle text-xs mt-1.5 leading-snug">
                          {r.description}
                        </p>
                      )}
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          <JourneyBlock
            stage="awareness"
            pillar={pillar}
            source={source}
            className="mt-12"
          />

          <NextStepBlock pillar={pillar} source={`${source}-next`} />
        </Container>
      </Section>
    </TemplateShell>
  );
}
