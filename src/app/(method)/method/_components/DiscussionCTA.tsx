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
 * Visually framed as a doorway into the paid community rather than a
 * generic external link — it's a deliberate hand-off from solo work
 * to peer accountability.
 */
export function DiscussionCTA({ moduleTitle, weekIndex, url }: DiscussionCTAProps) {
  const fallback = process.env.METHOD_NDY_DISCUSSION_URL;
  const target = url ?? fallback ?? null;

  if (!target) {
    return (
      <section className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
        <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
          Discuss
        </h2>
        <p className="text-sm text-foreground-muted">
          Discussion threads land inside Not Done Yet shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Discuss in Not Done Yet
      </h2>
      <p className="text-sm text-foreground-muted mb-4">
        Compare notes on Module {weekIndex.toString().padStart(2, "0")} —{" "}
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
    </section>
  );
}
