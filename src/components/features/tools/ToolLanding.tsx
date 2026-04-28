import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { getToolLanding, type ToolLandingContent, type ToolRelatedLink } from "@/lib/tools/landing-content";

interface ToolLandingProps {
  /** Tool slug — must exist in TOOL_LANDING_CONTENT. */
  slug: string;
}

/**
 * Renders the rich landing-page sections for a tool: 50-word answer,
 * what / who / how / limitations / examples / FAQ / related. The visible
 * FAQ here MUST stay in sync with the FAQPage JSON-LD emitted by
 * `<ToolSchemas slug={...} />` — both pull from the same registry, so
 * editing the registry updates both.
 */
export function ToolLanding({ slug }: ToolLandingProps) {
  const content = getToolLanding(slug);
  if (!content) return null;

  return (
    <>
      <AnswerSection content={content} />
      <WhatWhoSection content={content} />
      <HowSection content={content} />
      <ExamplesSection content={content} />
      <LimitationsSection content={content} />
      <FAQSection content={content} />
      <RelatedSection content={content} />
    </>
  );
}

function AnswerSection({ content }: { content: ToolLandingContent }) {
  return (
    <Section background="charcoal" className="!py-12">
      <Container width="narrow">
        <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6 md:p-8">
          <p className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-3">
            Quick answer
          </p>
          <p className="text-off-white text-lg leading-relaxed">
            {content.answerSummary}
          </p>
        </div>
      </Container>
    </Section>
  );
}

function WhatWhoSection({ content }: { content: ToolLandingContent }) {
  return (
    <Section background="deep-purple" grain className="!py-12">
      <Container width="narrow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
              WHAT IT DOES
            </h2>
            <div className="text-foreground-muted leading-relaxed space-y-3">
              {content.whatItDoes.split(/\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
              WHO IT&apos;S FOR
            </h2>
            <ul className="space-y-2 text-foreground-muted leading-relaxed">
              {content.whoItsFor.map((bullet, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-coral shrink-0 mt-1">→</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function HowSection({ content }: { content: ToolLandingContent }) {
  return (
    <Section background="charcoal" className="!py-12">
      <Container width="narrow">
        <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
          HOW IT WORKS
        </h2>
        <p className="text-foreground-muted leading-relaxed mb-6">{content.howItWorks}</p>
        <ol className="space-y-4">
          {content.howToSteps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-heading text-coral text-2xl shrink-0 leading-none w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-heading text-off-white text-base mb-1 uppercase tracking-wide">
                  {step.name}
                </p>
                <p className="text-foreground-muted text-sm leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function ExamplesSection({ content }: { content: ToolLandingContent }) {
  if (!content.examples.length) return null;
  return (
    <Section background="deep-purple" grain className="!py-12">
      <Container width="narrow">
        <h2 className="font-heading text-off-white mb-6" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
          EXAMPLE CALCULATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-heading text-off-white text-sm uppercase tracking-wide mb-3">
                {ex.scenario}
              </p>
              <ul className="text-foreground-muted text-sm space-y-1 mb-4">
                {ex.inputs.map((input, j) => (
                  <li key={j}>· {input}</li>
                ))}
              </ul>
              <p className="text-coral text-sm leading-relaxed">{ex.output}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function LimitationsSection({ content }: { content: ToolLandingContent }) {
  return (
    <Section background="charcoal" className="!py-12">
      <Container width="narrow">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
            LIMITATIONS
          </h2>
          <p className="text-foreground-muted leading-relaxed mb-5">{content.limitations}</p>
          <div className="border-t border-white/10 pt-5">
            <p className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-2">
              When to see a coach
            </p>
            <p className="text-foreground-muted leading-relaxed">{content.whenToSeeACoach}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function FAQSection({ content }: { content: ToolLandingContent }) {
  if (!content.faqs.length) return null;
  return (
    <Section background="deep-purple" grain className="!py-12">
      <Container width="narrow">
        <h2 className="font-heading text-off-white mb-6" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="space-y-3">
          {content.faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 open:bg-white/[0.05] transition-colors"
            >
              <summary className="cursor-pointer font-heading text-off-white text-base uppercase tracking-wide list-none flex items-start justify-between gap-4">
                <span>{faq.question}</span>
                <span className="text-coral text-xl leading-none shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-foreground-muted leading-relaxed mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function RelatedSection({ content }: { content: ToolLandingContent }) {
  if (!content.related.length) return null;
  return (
    <Section background="charcoal" className="!py-12">
      <Container width="narrow">
        <h2 className="font-heading text-off-white mb-6" style={{ fontSize: "var(--text-section-sm, 1.75rem)" }}>
          RELATED TOOLS &amp; READING
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.related.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 p-4 transition-colors"
              >
                <span className="text-coral text-xs font-body font-medium uppercase tracking-widest mb-1 block">
                  {labelForKind(link.kind)}
                </span>
                <span className="text-off-white text-sm">
                  {link.label} <span className="text-coral">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function labelForKind(kind: ToolRelatedLink["kind"]): string {
  switch (kind) {
    case "tool": return "Tool";
    case "article": return "Article";
    case "podcast": return "Podcast";
    case "topic": return "Topic hub";
    case "glossary": return "Glossary";
  }
}
