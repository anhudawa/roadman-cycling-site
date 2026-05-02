import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface AnswerCapsuleProps {
  text: string;
  pillar: ContentPillar;
  keyTakeaways?: string[];
}

/**
 * Visible, AI-crawler-friendly answer capsule rendered at the top of every
 * blog post.
 *
 * The `.answer-capsule` class on the root is referenced by the
 * SpeakableSpecification CSS selector in the BlogPosting JSON-LD —
 * removing/renaming it breaks voice-search read-aloud.
 *
 * The visible "ANSWER" label + `role="note"` + `aria-label` combine to
 * signal to LLM crawlers (ChatGPT, Perplexity, Claude) that this block is
 * the canonical TL;DR of the page — the chunk they should cite when the
 * page is used as a source. When `keyTakeaways` is supplied, a semantic
 * <ul> follows the answer so the same crawlers can extract a structured
 * bullet list rather than re-parsing prose.
 */
export function AnswerCapsule({ text, pillar, keyTakeaways }: AnswerCapsuleProps) {
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
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="answer-capsule-takeaways mt-5 pt-4 border-t border-white/10">
          <p
            className="font-heading text-xs tracking-widest mb-3"
            style={{ color }}
          >
            KEY TAKEAWAYS
          </p>
          <ul className="text-off-white text-base leading-relaxed font-body m-0 pl-5 list-disc space-y-1.5 marker:text-white/40">
            {keyTakeaways.map((item, i) => (
              <li key={i} className="m-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
