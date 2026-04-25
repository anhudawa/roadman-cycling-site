import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface AnswerCapsuleProps {
  text: string;
  pillar: ContentPillar;
}

/**
 * Visible, AI-crawler-friendly answer capsule rendered at the top of every
 * blog post.
 *
 * The `.answer-capsule` class on the root is referenced by the
 * SpeakableSpecification CSS selector in the BlogPosting JSON-LD $€”
 * removing/renaming it breaks voice-search read-aloud.
 *
 * The visible "ANSWER" label + `role="note"` + `aria-label` combine to
 * signal to LLM crawlers (ChatGPT, Perplexity, Claude) that this block is
 * the canonical TL;DR of the page $€” the chunk they should cite when the
 * page is used as a source.
 */
export function AnswerCapsule({ text, pillar }: AnswerCapsuleProps) {
  const { color } = CONTENT_PILLARS[pillar];

  return (
    <aside
      className="answer-capsule rounded-lg p-5 mb-8"
      role="note"
      aria-label="Answer summary"
      style={{
        borderLeft: `3px solid ${color}`,
        backgroundColor: `color-mix(in srgb, ${color} 5%, var(--color-charcoal))`,
      }}
    >
      <p
        className="font-heading text-xs tracking-widest mb-2"
        style={{ color }}
      >
        ANSWER
      </p>
      <p className="text-off-white text-base leading-relaxed font-body m-0">
        {text}
      </p>
    </aside>
  );
}
