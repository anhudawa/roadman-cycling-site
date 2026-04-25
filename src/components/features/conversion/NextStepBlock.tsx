import Link from "next/link";
import type { ContentPillar } from "@/types";

/**
 * NextStepBlock — a persistent, SSR-rendered conversion block designed
 * to sit after the FAQ section (or wherever a natural scroll breakpoint
 * ends in the article). Offers three contextual next steps rather than
 * relying on nav/footer CTAs to do the work.
 *
 * The three options are deliberately weighted:
 *   1. Coaching — the revenue action for problem-aware readers
 *   2. Community — the lower-friction commit for readers who aren't
 *      ready to apply but want to stay in orbit
 *   3. Related deep-dive — the content action for readers who just
 *      want the next thing to read
 *
 * Pillar-aware: the eyebrow and messaging shift slightly by pillar so
 * the block doesn't feel generic.
 */

const PILLAR_COPY: Record<
  ContentPillar,
  { eyebrow: string; headline: string; subheadline: string }
> = {
  coaching: {
    eyebrow: "NEXT STEP",
    headline: "APPLY WHAT YOU JUST READ.",
    subheadline:
      "Reading about training structure is different from having one built around your numbers and your calendar.",
  },
  nutrition: {
    eyebrow: "NEXT STEP",
    headline: "TURN THE SCIENCE INTO A PLAN.",
    subheadline:
      "Fuelling principles only matter when they're applied to your actual training week. That's what coaching is for.",
  },
  strength: {
    eyebrow: "NEXT STEP",
    headline: "LIFT LIKE A CYCLIST, NOT A BODYBUILDER.",
    subheadline:
      "Strength work has to be periodised with your riding or it compromises both. A coached plan handles the interaction.",
  },
  recovery: {
    eyebrow: "NEXT STEP",
    headline: "MAKE RECOVERY NON-NEGOTIABLE.",
    subheadline:
      "Knowing you need recovery is easy. Structuring a week that actually delivers it — around work, family and fatigue — is where coaching lives.",
  },
  community: {
    eyebrow: "NEXT STEP",
    headline: "KEEP EXPLORING THE CRAFT.",
    subheadline:
      "The best way to get better at cycling is to talk to people who are obsessed with it. We have a free community for that.",
  },
};

export interface NextStepBlockProps {
  pillar: ContentPillar;
  /** Source string for analytics tracking on the CTAs */
  source: string;
  /**
   * Optional relatedReading — a third "read next" option. Pass an
   * object with label + href and it becomes the tertiary link. If
   * absent the block falls back to linking the /start-here hub.
   */
  relatedReading?: { label: string; href: string };
}

export function NextStepBlock({
  pillar,
  source,
  relatedReading,
}: NextStepBlockProps) {
  const copy = PILLAR_COPY[pillar] ?? PILLAR_COPY.coaching;
  const tertiary = relatedReading ?? {
    label: "Start Here — Best of Roadman",
    href: "/start-here",
  };

  return (
    <aside
      className="mt-16 rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-10"
      aria-labelledby={`next-step-${source}`}
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        {copy.eyebrow}
      </p>
      <h2
        id={`next-step-${source}`}
        className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-3"
      >
        {copy.headline}
      </h2>
      <p className="text-foreground-muted text-sm md:text-base max-w-2xl leading-relaxed mb-6">
        {copy.subheadline}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Primary — coaching */}
        <Link
          href="/apply"
          data-track={`${source}-apply`}
          className="
            group flex flex-col h-full rounded-xl
            bg-coral text-off-white p-5
            hover:bg-coral/90 transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-off-white/60
          "
        >
          <span className="font-heading text-xs tracking-widest opacity-80">
            APPLY FOR COACHING
          </span>
          <span className="font-heading text-lg leading-snug mt-1 mb-auto">
            Not Done Yet — coaching community
          </span>
          <span className="text-sm opacity-90 mt-3">
            7-day free trial · $195/mo
          </span>
          <span
            aria-hidden="true"
            className="mt-3 text-sm font-heading tracking-wider group-hover:translate-x-0.5 transition-transform"
          >
            APPLY →
          </span>
        </Link>

        {/* Secondary — free community */}
        <Link
          href="/community/clubhouse"
          data-track={`${source}-clubhouse`}
          className="
            group flex flex-col h-full rounded-xl
            bg-white/[0.04] border border-white/10 text-off-white p-5
            hover:bg-white/[0.07] hover:border-coral/30 transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50
          "
        >
          <span className="font-heading text-xs tracking-widest text-coral">
            JOIN FREE
          </span>
          <span className="font-heading text-lg leading-snug mt-1 mb-auto">
            Roadman Clubhouse community
          </span>
          <span className="text-sm text-foreground-muted mt-3">
            Q&amp;A with Anthony · training plans · 2,100+ riders
          </span>
          <span
            aria-hidden="true"
            className="mt-3 text-sm font-heading tracking-wider text-coral group-hover:translate-x-0.5 transition-transform"
          >
            JOIN →
          </span>
        </Link>

        {/* Tertiary — keep reading */}
        <Link
          href={tertiary.href}
          data-track={`${source}-read-next`}
          className="
            group flex flex-col h-full rounded-xl
            bg-white/[0.04] border border-white/10 text-off-white p-5
            hover:bg-white/[0.07] hover:border-coral/30 transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50
          "
        >
          <span className="font-heading text-xs tracking-widest text-coral">
            KEEP READING
          </span>
          <span className="font-heading text-lg leading-snug mt-1 mb-auto">
            {tertiary.label}
          </span>
          <span className="text-sm text-foreground-muted mt-3">
            Curated from 1,400+ episodes and 170+ articles.
          </span>
          <span
            aria-hidden="true"
            className="mt-3 text-sm font-heading tracking-wider text-coral group-hover:translate-x-0.5 transition-transform"
          >
            OPEN →
          </span>
        </Link>
      </div>
    </aside>
  );
}
