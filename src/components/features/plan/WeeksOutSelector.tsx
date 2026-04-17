import Link from "next/link";
import { PHASES, type TrainingEvent } from "@/lib/training-plans";

interface Props {
  event: TrainingEvent;
  /** Optional heading override. Defaults to 'PICK HOW MANY WEEKS YOU'VE GOT'. */
  heading?: string;
}

/**
 * WeeksOutSelector — inline widget routing visitors from an event-specific
 * blog post (e.g. /blog/wicklow-200-training-plan) into the programmatic
 * /plan/[event]/[weeks-out] landing pages. Presents all 6 phases as cards
 * so a rider self-selects their current window.
 *
 * Used in the blog slug page when `event.blogSlug` matches the post slug.
 */
export function WeeksOutSelector({
  event,
  heading = "PICK HOW MANY WEEKS YOU'VE GOT",
}: Props) {
  return (
    <div className="not-prose my-10 rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-6 md:p-8">
      <p className="font-heading text-coral text-xs tracking-widest mb-2">
        {event.name.toUpperCase()} · BUILD MY PLAN
      </p>
      <h3 className="font-heading text-off-white text-xl md:text-2xl mb-5 leading-tight">
        {heading}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PHASES.map((p) => (
          <Link
            key={p.slug}
            href={`/plan/${event.slug}/${p.slug}`}
            className="
              group rounded-xl border border-white/10 bg-white/[0.03]
              hover:bg-white/[0.06] hover:border-coral/30 transition-all
              p-4 text-left block
            "
          >
            <p className="font-heading text-coral text-2xl leading-none mb-1">
              {p.weeksOut}
            </p>
            <p className="text-[10px] text-foreground-subtle font-body tracking-widest uppercase mb-2">
              weeks out
            </p>
            <p className="font-heading text-off-white text-sm leading-tight group-hover:text-coral transition-colors">
              {p.label}
            </p>
          </Link>
        ))}
      </div>
      <p className="text-foreground-subtle text-xs mt-4">
        Every window is a different phase: base, build, peak, taper. Pick the
        one that matches where you are right now.
      </p>
    </div>
  );
}
