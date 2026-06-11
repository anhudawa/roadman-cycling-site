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
  // The plan is applied to the rider's TrainingPeaks account during
  // onboarding, so this per-module link stays a placeholder until a real
  // (absolute) plan URL is dropped in. Until then, show a status pill
  // instead of a CTA that would open a 404 in a new tab.
  const isLive = /^https?:\/\//i.test(resource.href);

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
        {isLive ? (
          <a
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-off-white text-sm shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
          >
            Open in TrainingPeaks →
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-md border border-coral/40 bg-charcoal/70 px-5 py-2.5 font-heading uppercase tracking-wider text-coral text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-coral/70" />
              <span className="relative h-2 w-2 rounded-full bg-coral" />
            </span>
            Applied to your account at onboarding
          </span>
        )}
      </div>
    </section>
  );
}
