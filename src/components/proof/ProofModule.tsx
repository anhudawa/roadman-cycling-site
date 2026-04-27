import { type Testimonial } from "@/lib/testimonials";
import { TestimonialBlock } from "./TestimonialBlock";
import { AthleteProfileCard, type AthleteProfile } from "./AthleteProfileCard";
import { BeforeAfterMetrics, type MetricRow } from "./BeforeAfterMetrics";
import { CoachingCTA } from "./CoachingCTA";

interface ProofModuleProps {
  /** Eyebrow above the section heading. Defaults to "REAL RESULTS". */
  eyebrow?: string;
  /** Section heading */
  heading?: string;
  /** Supporting paragraph below the heading */
  intro?: string;
  /** Optional spotlight testimonial pinned at the top */
  spotlight?: Testimonial;
  /** 2-3 athlete profiles or testimonials in a grid */
  athletes?: AthleteProfile[];
  /** Up to 3 testimonials (compact variant) — alternative to athletes */
  testimonials?: Testimonial[];
  /** Optional metric ladder (single before/after group) */
  metrics?: MetricRow[];
  /** Optional metric block title (e.g. athlete name) */
  metricsTitle?: string;
  /** Optional metric block subtitle */
  metricsSubtitle?: string;
  /** Whether to render the trailing coaching CTA. Default: true */
  showCTA?: boolean;
  /** Source string for CTA analytics */
  source: string;
  className?: string;
}

/**
 * Pre-composed proof/case-study module designed for coaching templates,
 * /coaching, and high-intent blog footers.
 *
 * Slots, in render order:
 *   1. Section heading + intro
 *   2. Spotlight testimonial (single pull-out)
 *   3. Athlete profile cards (3-up grid) — OR testimonials (3-up grid)
 *   4. Before/after metric ladder
 *   5. Coaching CTA (optional)
 *
 * Pass only the slots that fit the page. Default behaviour omits
 * anything you don't supply, so a single component scales from a small
 * proof rail to a full case-study section.
 */
export function ProofModule({
  eyebrow = "REAL RESULTS",
  heading = "FROM REAL CYCLISTS",
  intro = "Not influencers. Not pros. Serious amateur and masters cyclists with jobs, families, and limited training hours.",
  spotlight,
  athletes,
  testimonials,
  metrics,
  metricsTitle,
  metricsSubtitle,
  showCTA = true,
  source,
  className = "",
}: ProofModuleProps) {
  // Prefer athletes when both supplied; testimonials fall back if no athletes given.
  const showAthletes = athletes && athletes.length > 0;
  const showTestimonialGrid =
    !showAthletes && testimonials && testimonials.length > 0;

  return (
    <section
      aria-label="Member results and proof"
      className={`space-y-10 ${className}`}
    >
      {(eyebrow || heading || intro) && (
        <header className="text-center max-w-2xl mx-auto">
          {eyebrow && (
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              {heading}
            </h2>
          )}
          {intro && (
            <p className="text-foreground-muted mt-4 leading-relaxed">
              {intro}
            </p>
          )}
        </header>
      )}

      {spotlight && (
        <TestimonialBlock testimonial={spotlight} variant="spotlight" />
      )}

      {showAthletes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {athletes!.map((a) => (
            <AthleteProfileCard key={a.name} {...a} />
          ))}
        </div>
      )}

      {showTestimonialGrid && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials!.slice(0, 3).map((t) => (
            <TestimonialBlock
              key={t.name}
              testimonial={t}
              variant="compact"
              preferShort
            />
          ))}
        </div>
      )}

      {metrics && metrics.length > 0 && (
        <BeforeAfterMetrics
          metrics={metrics}
          eyebrow={metricsTitle ? "MEASURED CHANGE" : undefined}
          title={metricsTitle}
          subtitle={metricsSubtitle}
        />
      )}

      {showCTA && <CoachingCTA source={source} />}
    </section>
  );
}
