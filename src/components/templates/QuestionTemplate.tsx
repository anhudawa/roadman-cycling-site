import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Button } from "@/components/ui";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { EvidenceLevel, type EvidenceLevelType } from "@/components/ui/EvidenceLevel";
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

export interface QuestionFaq {
  question: string;
  answer: string;
}

export interface CoachingCta {
  /** Optional eyebrow — defaults to "STILL FIGURING IT OUT?" */
  eyebrow?: string;
  /** Headline — defaults to "A coach removes the guesswork." */
  heading?: string;
  /** Optional supporting line below the heading */
  body?: string;
  /** Where the primary CTA points — defaults to /apply */
  href?: string;
  /** Button label — defaults to "Apply for Coaching" */
  label?: string;
}

interface QuestionTemplateProps {
  /** The question itself, used as the H1, e.g. "How long is the FTP test?" */
  question: string;
  /** The 40-60 word answer. Renders inside AnswerCapsule for AI citation. */
  answer: string;
  pillar: ContentPillar;
  /** Optional eyebrow — defaults to "QUESTION" */
  eyebrow?: string;
  /** Optional one-line "Best for" / "Not for" labels rendered under the answer. */
  bestFor?: string;
  notFor?: string;
  /** Single-sentence key takeaway — rendered as a pull-quote between the answer and the body. */
  keyTakeaway?: string;
  /** Evidence-grade label (Strong / Moderate / Emerging / Anecdotal). */
  evidenceLevel?: EvidenceLevelType;
  /** Override copy for the EvidenceLevel block. */
  evidenceNote?: ReactNode;
  /** Body — usually MDX content, headings, etc. Optional if the answer alone is enough. */
  children?: ReactNode;
  /** Evidence points, citations, episode references */
  evidence?: EvidencePoint[];
  /** FAQ rows — each gets its own row in a FAQPage-friendly layout. */
  faq?: QuestionFaq[];
  /** Related questions / topic links */
  related?: RelatedLink[];
  /** Coaching CTA — overrides defaults for the closer block. */
  coachingCta?: CoachingCta;
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
  bestFor,
  notFor,
  keyTakeaway,
  evidenceLevel,
  evidenceNote,
  children,
  evidence,
  faq,
  related,
  coachingCta,
  source,
}: QuestionTemplateProps) {
  const ctaEyebrow = coachingCta?.eyebrow ?? "STILL FIGURING IT OUT?";
  const ctaHeading = coachingCta?.heading ?? "A coach removes the guesswork.";
  const ctaHref = coachingCta?.href ?? "/apply";
  const ctaLabel = coachingCta?.label ?? "Apply for Coaching";

  return (
    <TemplateShell title={question} eyebrow={eyebrow} pillar={pillar}>
      <Section background="charcoal" className="!py-12">
        <Container width="narrow">
          <AnswerCapsule text={answer} pillar={pillar} />

          {(bestFor || notFor) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 not-prose">
              {bestFor && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    borderLeft: "3px solid #4CAF50",
                    backgroundColor:
                      "color-mix(in srgb, #4CAF50 6%, var(--color-charcoal))",
                  }}
                >
                  <p
                    className="font-heading text-xs tracking-[0.3em] mb-1.5"
                    style={{ color: "#4CAF50" }}
                  >
                    BEST FOR
                  </p>
                  <p className="text-off-white text-sm leading-relaxed font-body m-0">
                    {bestFor}
                  </p>
                </div>
              )}
              {notFor && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    borderLeft: "3px solid #F16363",
                    backgroundColor:
                      "color-mix(in srgb, #F16363 6%, var(--color-charcoal))",
                  }}
                >
                  <p
                    className="font-heading text-xs tracking-[0.3em] mb-1.5"
                    style={{ color: "#F16363" }}
                  >
                    NOT FOR
                  </p>
                  <p className="text-off-white text-sm leading-relaxed font-body m-0">
                    {notFor}
                  </p>
                </div>
              )}
            </div>
          )}

          {keyTakeaway && (
            <aside
              className="mb-8 rounded-lg border-l-4 border-coral bg-white/[0.03] p-5 not-prose"
              role="note"
              aria-label="Key takeaway"
            >
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
                KEY TAKEAWAY
              </p>
              <p className="text-off-white text-base leading-relaxed font-body m-0">
                {keyTakeaway}
              </p>
            </aside>
          )}

          {evidenceLevel && (
            <EvidenceLevel
              level={evidenceLevel}
              variant="block"
              note={evidenceNote}
            />
          )}

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
              <ul className="space-y-3 list-none p-0">
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

          {faq && faq.length > 0 && (
            <section className="mt-12" aria-labelledby={`faq-${source}`}>
              <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                FAQ
              </p>
              <h2
                id={`faq-${source}`}
                className="font-heading text-off-white text-2xl mb-6"
              >
                COMMON FOLLOW-UPS
              </h2>
              <div className="space-y-3">
                {faq.map((f) => (
                  <Card key={f.question} className="p-5" hoverable={false}>
                    <h3 className="font-heading text-off-white text-base mb-2">
                      {f.question}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-relaxed m-0">
                      {f.answer}
                    </p>
                  </Card>
                ))}
              </div>
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

          <div className="mt-12 rounded-lg border border-coral/30 bg-coral/[0.05] p-6 text-center">
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-2">
              {ctaEyebrow}
            </p>
            <p className="font-heading text-off-white text-xl mb-2">
              {ctaHeading}
            </p>
            {coachingCta?.body && (
              <p className="text-foreground-muted text-sm leading-relaxed mb-4 max-w-xl mx-auto">
                {coachingCta.body}
              </p>
            )}
            <Button
              href={ctaHref}
              size="lg"
              dataTrack={`question_${source}_apply`}
              className="mt-2"
            >
              {ctaLabel}
            </Button>
          </div>

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
