import Link from "next/link";

/**
 * Contextual link from a blog post back to its primary topic hub,
 * rendered near the top of the article (between the answer capsule
 * and the prose body).
 *
 * Why near the top: hub ownership is a topic-clustering signal for
 * search engines and a navigation cue for readers. Burying the link
 * in the footer leaves both groups guessing where the article fits
 * in the site's information architecture. The "MORE ON THIS TOPIC"
 * pills further down are kept — this is the lead-in equivalent.
 */
export function PrimaryHubLink({
  hubSlug,
  hubTitle,
}: {
  hubSlug: string;
  hubTitle: string;
}) {
  return (
    <aside
      aria-label="Primary topic hub"
      className="not-prose mb-8 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:border-coral/40 transition-colors"
    >
      <Link
        href={`/topics/${hubSlug}`}
        className="group flex items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="font-heading text-coral text-xs tracking-[0.3em] mb-1">
            PART OF THE GUIDE
          </p>
          <p className="font-heading text-off-white text-base md:text-lg leading-snug truncate group-hover:text-coral transition-colors">
            {hubTitle}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 font-heading text-coral text-xl group-hover:translate-x-1 transition-transform"
        >
          →
        </span>
      </Link>
    </aside>
  );
}
