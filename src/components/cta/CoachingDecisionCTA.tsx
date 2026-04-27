import Link from "next/link";

/**
 * CoachingDecisionCTA — for "should I get a coach or use TrainerRoad?"
 * comparison content. Sends the reader into the interactive decision
 * flow rather than lead-capturing — the quiz itself does the capture
 * once the reader has invested a few clicks.
 */
export interface CoachingDecisionCTAProps {
  source?: string;
  /** Override the destination if the decision flow is hosted elsewhere. */
  href?: string;
  className?: string;
}

export function CoachingDecisionCTA({
  source = "coaching-decision-cta",
  href = "/tools/coach-or-app",
  className = "",
}: CoachingDecisionCTAProps) {
  return (
    <aside
      className={`rounded-xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 ${className}`}
      aria-labelledby={`coach-decision-${source}`}
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        STILL ON THE FENCE?
      </p>
      <h3
        id={`coach-decision-${source}`}
        className="font-heading text-xl md:text-2xl text-off-white mb-2 leading-tight"
      >
        TAKE THE QUIZ: COACH OR APP?
      </h3>
      <p className="text-foreground-muted text-sm md:text-base mb-5 leading-relaxed">
        Six honest questions. We&apos;ll tell you whether you&apos;re actually
        ready for a coach, or whether a structured app like TrainerRoad gets
        you 80% of the way for now.
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
        TAKE THE QUIZ <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
