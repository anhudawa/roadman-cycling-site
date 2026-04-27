import Link from "next/link";

/**
 * PlateauCTA — for FTP plateau articles. Drops the reader into the
 * Plateau Diagnostic flow rather than capturing email up front. The
 * diagnostic itself does the lead capture once we've earned it.
 */
export interface PlateauCTAProps {
  source?: string;
  /** Override the destination if a more specific diagnostic flow exists. */
  href?: string;
  className?: string;
}

export function PlateauCTA({
  source = "plateau-cta",
  href = "/tools/plateau-diagnostic",
  className = "",
}: PlateauCTAProps) {
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
