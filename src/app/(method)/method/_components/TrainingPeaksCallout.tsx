import type { ResourceLink } from "@/lib/method/modules";

interface TrainingPeaksCalloutProps {
  resource: Extract<ResourceLink, { kind: "training-peaks" }>;
}

/**
 * Promoted card for a TrainingPeaks plan link. Rendered above the
 * standard resource list when a module ships with a TP plan, so the
 * integration reads as a premium handover rather than a stray URL.
 *
 * Visual: red-orange glow (TP brand-adjacent) with coral border, big
 * "Open in TrainingPeaks" CTA, two short bullets explaining what the
 * plan includes.
 */
export function TrainingPeaksCallout({ resource }: TrainingPeaksCalloutProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-coral/30 bg-gradient-to-br from-charcoal via-charcoal/90 to-deep-purple/40 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-coral/15 blur-3xl"
      />
      <div className="relative">
        <p className="font-heading text-[11px] tracking-[0.3em] text-coral mb-2">
          PREMIUM · TRAININGPEAKS
        </p>
        <h2 className="font-heading uppercase tracking-wider text-xl mb-2">
          {resource.title}
        </h2>
        <ul className="space-y-1.5 text-sm text-foreground-muted mb-5">
          <li className="flex items-baseline gap-2">
            <span className="text-coral text-xs">▸</span>
            <span>Workouts pushed straight to your calendar.</span>
          </li>
          <li className="flex items-baseline gap-2">
            <span className="text-coral text-xs">▸</span>
            <span>Targets, RPE, and notes built in — open the bike app, ride.</span>
          </li>
        </ul>
        <a
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-off-white text-sm shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
        >
          Open in TrainingPeaks →
        </a>
      </div>
    </section>
  );
}
