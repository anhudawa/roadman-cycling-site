import Link from "next/link";

interface AskRoadmanCTAProps {
  /** The page subject — used to build the pre-filled question. */
  topic: string;
  /**
   * Override the auto-generated question. When provided, this exact
   * string seeds the Ask Roadman input.
   */
  question?: string;
  /** Source tag for analytics + the `from` query param. */
  source: string;
  /**
   * "card" — full-width bordered block (default), used at the foot of an
   * answer-native page.
   * "inline" — compact pill-style link, used inside dense layouts.
   */
  variant?: "card" | "inline";
  /** Override the headline above the button (card variant only). */
  heading?: string;
  /** Override the CTA button label. */
  buttonLabel?: string;
  className?: string;
}

function buildQuestion(topic: string, override?: string): string {
  if (override && override.trim().length > 0) return override.trim();
  const cleaned = topic.replace(/\s+/g, " ").trim();
  return `Ask Roadman about: ${cleaned}`;
}

function buildHref(question: string, source: string): string {
  const params = new URLSearchParams();
  params.set("q", question);
  params.set("from", source);
  return `/ask?${params.toString()}`;
}

/**
 * Contextual handoff to /ask that carries the current page's topic into
 * the assistant. Pre-fills the chat input with a Roadman-voiced question
 * so a reader who hits the bottom of an article, episode, or comparison
 * can take their next thought straight into the assistant without
 * re-typing context.
 *
 * Renders semantic <aside> with role="complementary" so AI crawlers
 * recognise it as a related-action link rather than primary content.
 */
export function AskRoadmanCTA({
  topic,
  question,
  source,
  variant = "card",
  heading = "STILL HAVE QUESTIONS?",
  buttonLabel = "Ask Roadman",
  className = "",
}: AskRoadmanCTAProps) {
  const composed = buildQuestion(topic, question);
  const href = buildHref(composed, source);

  if (variant === "inline") {
    return (
      <Link
        href={href}
        data-track={`ask_cta_${source}`}
        className={`inline-flex items-center gap-2 rounded-lg border border-coral/40 bg-coral/[0.06] hover:bg-coral/[0.12] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all ${className}`}
      >
        <span className="text-coral">↳</span>
        Ask Roadman about this
      </Link>
    );
  }

  return (
    <aside
      role="complementary"
      aria-label="Ask Roadman about this page"
      className={`mt-10 rounded-xl border border-white/10 bg-gradient-to-br from-coral/[0.06] via-deep-purple/30 to-charcoal p-5 md:p-6 ${className}`}
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-2">
        {heading}
      </p>
      <p className="text-off-white text-base md:text-lg leading-snug font-heading mb-1">
        Take this into the assistant.
      </p>
      <p className="text-foreground-muted text-sm mb-4 max-w-xl">
        Ask Roadman is grounded in 1,400+ on-the-record podcast conversations.
        Cited answers in your context — no re-typing.
      </p>
      <Link
        href={href}
        data-track={`ask_cta_${source}`}
        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-5 py-2.5 text-sm transition-colors"
      >
        {buttonLabel} →
      </Link>
    </aside>
  );
}
