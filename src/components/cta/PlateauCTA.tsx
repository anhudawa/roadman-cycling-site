import Link from "next/link";

/**
 * PlateauCTA — drops the reader into the Plateau Diagnostic flow rather
 * than capturing email up front. The diagnostic itself does the lead
 * capture once we've earned it.
 *
 * Two variants:
 *   - "default" (card): the heavy hero-card form used by IntentCTA when
 *     an article is specifically about plateaus.
 *   - "inline" (editorial): the universal entry-CTA used on every blog,
 *     guest, and podcast page regardless of topic. Slim left-bar block,
 *     one compelling line, primary link to /plateau and a softer
 *     secondary link to /find-your-fit for readers who aren't sure
 *     they're plateaued.
 */
export interface PlateauCTAProps {
  source?: string;
  /** Override the destination if a more specific diagnostic flow exists. */
  href?: string;
  className?: string;
  /** Layout variant. "default" is the card; "inline" is the editorial bar. */
  variant?: "default" | "inline";
}

export function PlateauCTA({
  source = "plateau-cta",
  href = "/plateau",
  className = "",
  variant = "default",
}: PlateauCTAProps) {
  if (variant === "inline") {
    return (
      <aside
        className={`border-l-2 border-coral/60 pl-5 md:pl-6 py-3 my-10 ${className}`}
        aria-labelledby={`plateau-cta-${source}`}
      >
        <p className="font-heading text-coral text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2">
          Where the next gain hides
        </p>
        <p
          id={`plateau-cta-${source}`}
          className="text-off-white text-base md:text-lg leading-relaxed"
        >
          Five minutes. One specific answer for why your training&apos;s
          stalled and the next thing to change.{" "}
          <Link
            href={href}
            data-track={`${source}-plateau`}
            className="text-coral hover:text-coral-hover underline underline-offset-4 decoration-coral/40 hover:decoration-coral transition-colors"
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            Take the Plateau Diagnostic
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
        <p className="text-foreground-subtle text-sm mt-2 leading-relaxed">
          Not sure which Roadman option fits?{" "}
          <Link
            href="/find-your-fit"
            data-track={`${source}-find-your-fit`}
            className="text-foreground-muted hover:text-coral underline underline-offset-4 decoration-foreground-subtle/30 hover:decoration-coral transition-colors"
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            Try Find Your Fit
          </Link>
          .
        </p>
      </aside>
    );
  }

  return (
    <aside
      className={`rounded-xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 ${className}`}
      aria-labelledby={`plateau-cta-${source}`}
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        STUCK ON A PLATEAU?
      </p>
      <h3
        id={`plateau-cta-${source}`}
        className="font-heading text-xl md:text-2xl text-off-white mb-2 leading-tight"
      >
        TAKE THE FREE PLATEAU DIAGNOSTIC
      </h3>
      <p className="text-foreground-muted text-sm md:text-base mb-5 leading-relaxed">
        Five minutes. We&apos;ll pinpoint why your FTP&apos;s stalled and tell
        you exactly what to change next — based on what actually works for the
        riders we coach.
      </p>
      <Link
        href={href}
        data-track={`${source}-start`}
        className="
          inline-flex items-center gap-2
          font-heading tracking-wider text-sm
          bg-coral hover:bg-coral-hover
          text-off-white px-6 py-3 rounded-md
          transition-colors cursor-pointer
        "
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        START THE DIAGNOSTIC <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
