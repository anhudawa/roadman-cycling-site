interface DiscussionCTAProps {
  moduleTitle: string;
  weekIndex: number;
  url: string | null;
}

/**
 * Live home of the Not Done Yet community on Skool. Used site-wide (see
 * brand-facts.ts, ask/cta.ts, the /community pages). This is the floor the
 * Discuss CTA always lands on, so a paying member is never shown a dead or
 * "coming soon" community link.
 */
const NDY_COMMUNITY_URL =
  "https://www.skool.com/roadmancycling?utm_source=method&utm_medium=module&utm_campaign=discuss";

/**
 * "Discuss this module in Not Done Yet" CTA.
 *
 * Target precedence:
 *   1. A module-specific Skool thread (`url`, from `module.discussionUrl`)
 *   2. An env-configured community/thread link (`METHOD_NDY_DISCUSSION_URL`)
 *   3. The live Not Done Yet community home (always set)
 *
 * When we have a specific thread (1 or an explicit env thread) the copy
 * invites the member to open *the thread*; when we fall through to the
 * community home the copy honestly points them into the community to post,
 * rather than implying a dedicated Module-N thread already exists.
 */
export function DiscussionCTA({ moduleTitle, weekIndex, url }: DiscussionCTAProps) {
  const envThread = process.env.METHOD_NDY_DISCUSSION_URL?.trim() || null;
  const specificThread = url ?? envThread;
  const target = specificThread ?? NDY_COMMUNITY_URL;
  const week = weekIndex.toString().padStart(2, "0");

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
          {specificThread ? (
            <>
              Compare notes on Module {week} —{" "}
              <span className="text-off-white">{moduleTitle}</span> — with the
              rest of the cohort.
            </>
          ) : (
            <>
              Working through Module {week} —{" "}
              <span className="text-off-white">{moduleTitle}</span>? Post your
              numbers, ask the questions, and see how the rest of the cohort is
              getting on.
            </>
          )}
        </p>
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-coral/40 bg-coral/10 hover:bg-coral/15 px-4 py-2 font-heading uppercase tracking-wider text-coral text-sm transition-all active:scale-[0.97]"
        >
          {specificThread ? "Open the thread →" : "Open Not Done Yet →"}
        </a>
      </div>
    </section>
  );
}
