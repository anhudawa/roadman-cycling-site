interface DiscussionCTAProps {
  moduleTitle: string;
  weekIndex: number;
  url: string | null;
}

/**
 * "Discuss this module in Not Done Yet" CTA. Each module can carry a
 * specific Skool thread URL; if it doesn't, falls back to the community
 * URL configured via env (METHOD_NDY_DISCUSSION_URL).
 *
 * If neither a per-module thread nor the env fallback is set, we still
 * render an intentional card — a "threads land here soon" coming-soon
 * with the same visual weight as the live state, so the layout never
 * feels half-shipped.
 */
export function DiscussionCTA({ moduleTitle, weekIndex, url }: DiscussionCTAProps) {
  const fallback = process.env.METHOD_NDY_DISCUSSION_URL;
  const target = url ?? fallback ?? null;
  const week = weekIndex.toString().padStart(2, "0");

  if (!target) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-charcoal/60 p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-deep-purple/40 blur-3xl"
        />
        <div className="relative">
          <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-2">
            Discuss · Not Done Yet
          </h2>
          <p className="text-sm text-foreground-muted mb-4 leading-relaxed">
            Want to compare notes on{" "}
            <span className="text-off-white">{moduleTitle}</span> with riders
            working the same system? That conversation lives inside Not Done
            Yet — weekly calls with Anthony and a cohort going through the same
            twelve weeks.
          </p>
          <a
            href="/community/not-done-yet?from=method-module"
            className="inline-flex items-center gap-2 rounded-md border border-coral/40 bg-coral/10 hover:bg-coral/15 px-4 py-2 font-heading uppercase tracking-wider text-coral text-sm transition-all active:scale-[0.97]"
          >
            See Not Done Yet →
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/10 bg-charcoal/60 p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-coral/10 blur-3xl"
      />
      <div className="relative">
        <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
          Discuss in Not Done Yet
        </h2>
        <p className="text-sm text-foreground-muted mb-4">
          Compare notes on Module {week} —{" "}
          <span className="text-off-white">{moduleTitle}</span> — with the rest of
          the cohort.
        </p>
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-coral/40 bg-coral/10 hover:bg-coral/15 px-4 py-2 font-heading uppercase tracking-wider text-coral text-sm transition-all active:scale-[0.97]"
        >
          Open the thread →
        </a>
      </div>
    </section>
  );
}
