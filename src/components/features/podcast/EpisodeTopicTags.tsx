import Link from "next/link";

interface TopicLite {
  slug: string;
  label: string;
}

interface EpisodeTopicTagsProps {
  tags: TopicLite[];
  className?: string;
}

/**
 * Episode → Topic Hub link block. Each tag is an internal link to
 * `/topics/<slug>` so episode pages feed the hub-and-spoke structure
 * Google rewards: hubs collect topical authority; episodes funnel
 * users (and crawlers) into them.
 */
export function EpisodeTopicTags({
  tags,
  className = "",
}: EpisodeTopicTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <section aria-label="Topics covered" className={className}>
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        TOPICS
      </p>
      <ul className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/topics/${t.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:border-coral/40 hover:bg-coral/10 px-3 py-1.5 text-xs font-heading tracking-wider text-off-white hover:text-coral transition-colors"
            >
              <span aria-hidden className="text-coral/70">#</span>
              {t.label.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type { TopicLite };
