import Link from "next/link";

/**
 * Contextual backlink from a blog post to the topic-cluster hub that
 * aggregates it (e.g. /training/zone-2, /masters/vo2max). Rendered near
 * the top of the article, alongside the topic PrimaryHubLink. This is the
 * article→hub half of the bidirectional cluster link; the hub→article
 * half is the article grid on the hub page itself.
 *
 * Distinct eyebrow ("PART OF THE HUB") from PrimaryHubLink's "PART OF THE
 * GUIDE" so a post that belongs to both a topic and a cluster shows two
 * clearly different navigation cues rather than a confusing duplicate.
 */
export function ClusterHubLink({
  path,
  label,
}: {
  path: string;
  label: string;
}) {
  return (
    <aside
      aria-label="Topic cluster hub"
      className="not-prose mb-8 rounded-xl border border-coral/20 bg-coral/[0.04] px-5 py-4 hover:border-coral/50 transition-colors"
    >
      <Link
        href={path}
        className="group flex items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="font-heading text-coral text-xs tracking-[0.3em] mb-1">
            PART OF THE HUB
          </p>
          <p className="font-heading text-off-white text-base md:text-lg leading-snug truncate group-hover:text-coral transition-colors">
            {label}
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
