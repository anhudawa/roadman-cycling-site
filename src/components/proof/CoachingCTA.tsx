import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface CoachingCTAProps {
  /** Eyebrow line above the headline. Defaults to "WORK WITH ANTHONY" */
  eyebrow?: string;
  /** Main heading. Defaults to a coaching-focused headline */
  heading?: string;
  /** Supporting paragraph. Defaults to the standard coaching pitch */
  body?: string;
  /** Primary CTA label. Defaults to "Apply for Coaching" */
  primaryLabel?: string;
  /** Primary CTA href. Defaults to /apply */
  primaryHref?: string;
  /** Secondary CTA label. Defaults to "How Coaching Works" */
  secondaryLabel?: string;
  /** Secondary CTA href. Defaults to /coaching */
  secondaryHref?: string;
  /** dataTrack source for analytics */
  source: string;
  /** Visual density. "panel" = card with border. "inline" = flush block. */
  variant?: "panel" | "inline";
  className?: string;
}

/**
 * Composable coaching CTA. The default copy reflects the coaching-first
 * narrative used across the site — "evidence-based coaching for serious
 * amateur and masters cyclists" — and links to /apply (primary) and
 * /coaching (secondary) at $195/month with a 7-day free trial.
 *
 * Override copy for context-specific pages (e.g. methodology, individual
 * blog topics, problem-page bottom CTAs) but keep the destinations
 * consistent so attribution analytics aggregate cleanly via dataTrack.
 */
export function CoachingCTA({
  eyebrow = "WORK WITH ANTHONY",
  heading = "EVIDENCE-BASED COACHING. PERSONAL TO YOUR NUMBERS.",
  body = "Not Done Yet is the coaching community for serious amateur and masters cyclists who refuse to plateau. $195/month. 7-day free trial. Cancel anytime.",
  primaryLabel = "Apply for Coaching",
  primaryHref = "/apply",
  secondaryLabel = "How Coaching Works",
  secondaryHref = "/coaching",
  source,
  variant = "panel",
  className = "",
}: CoachingCTAProps) {
  const wrapperClasses =
    variant === "panel"
      ? "rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-10"
      : "py-10";

  return (
    <aside
      className={`${wrapperClasses} text-center ${className}`}
      aria-label="Coaching call to action"
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        {eyebrow}
      </p>
      <h3 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-3 max-w-2xl mx-auto">
        {heading}
      </h3>
      <p className="text-foreground-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-6">
        {body}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          href={primaryHref}
          size="lg"
          dataTrack={`${source}_coaching_apply`}
        >
          {primaryLabel}
        </Button>
        <Button
          href={secondaryHref}
          variant="ghost"
          size="lg"
          dataTrack={`${source}_coaching_secondary`}
        >
          {secondaryLabel}
        </Button>
      </div>
      <p className="text-foreground-subtle text-xs mt-4">
        $195/month. 7-day free trial. Reviewed personally by{" "}
        <Link href="/author/anthony-walsh" className="hover:text-coral transition-colors">
          Anthony Walsh
        </Link>
        .
      </p>
    </aside>
  );
}
