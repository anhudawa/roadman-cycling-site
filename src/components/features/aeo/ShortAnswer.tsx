import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface ShortAnswerProps {
  /** The extractable answer. Plain text, 1–3 sentences works best. */
  text: string;
  /** Pillar drives the accent colour — falls back to coral when omitted. */
  pillar?: ContentPillar;
  /** Override the eyebrow label above the answer. */
  heading?: string;
  className?: string;
}

/**
 * Answer-first summary block for AEO templates that don't already render
 * an `AnswerCapsule` (compare, best, problem, topic). Semantic <section>
 * with the `.short-answer` class — referenced by SpeakableSpecification
 * JSON-LD on those pages so voice search and LLM crawlers (ChatGPT,
 * Perplexity, Claude) can extract the canonical answer.
 *
 * Visually distinct from AnswerCapsule (which targets long-form articles)
 * by using a heading-led header rather than the "ANSWER" eyebrow — gives
 * comparison/problem pages an answer block that reads naturally without
 * implying the rest of the page is unanswered context.
 */
export function ShortAnswer({
  text,
  pillar,
  heading = "THE SHORT ANSWER",
  className = "",
}: ShortAnswerProps) {
  const accent = pillar ? CONTENT_PILLARS[pillar].color : "var(--color-coral)";

  return (
    <section
      className={`short-answer rounded-lg p-5 md:p-6 ${className}`}
      aria-label="Key takeaway"
      style={{
        borderLeft: `3px solid ${accent}`,
        backgroundColor: `color-mix(in srgb, ${accent} 6%, var(--color-charcoal))`,
      }}
    >
      <h2
        className="font-heading text-xs tracking-widest mb-2 m-0"
        style={{ color: accent }}
      >
        {heading}
      </h2>
      <p className="text-off-white text-base md:text-lg leading-relaxed font-body m-0">
        {text}
      </p>
    </section>
  );
}
