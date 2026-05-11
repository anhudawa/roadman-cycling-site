interface DiscussionCTAProps {
  moduleTitle: string;
  weekIndex: number;
  url: string | null;
}

/**
 * "Discuss this module in Not Done Yet" CTA. Each module can carry a
 * specific Skool thread URL; if it doesn't, falls back to the community
 * URL configured via env (METHOD_NDY_DISCUSSION_URL).
 */
export function DiscussionCTA({ moduleTitle, weekIndex, url }: DiscussionCTAProps) {
  const fallback = process.env.METHOD_NDY_DISCUSSION_URL;
  const target = url ?? fallback ?? null;

  if (!target) {
    return (
      <section className="rounded-lg border border-white/10 bg-charcoal/60 p-5">
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
    <section className="rounded-lg border border-white/10 bg-charcoal/60 p-5">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Discuss
      </h2>
      <p className="text-sm text-foreground-muted mb-4">
        Compare notes on Module {weekIndex.toString().padStart(2, "0")} —{" "}
        {moduleTitle} — with the rest of the cohort.
      </p>
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-heading uppercase tracking-wider text-coral hover:text-coral-hover"
      >
        OPEN IN NOT DONE YET →
      </a>
    </section>
  );
}
