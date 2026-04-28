import Link from "next/link";
import { Badge } from "@/components/ui";
import { getRelatedEpisodes } from "@/lib/podcast";
import { type ContentPillar } from "@/types";

interface RelatedEpisodesProps {
  currentSlug: string;
  pillar: ContentPillar;
  keywords: string[];
  title: string;
  limit?: number;
  className?: string;
}

/**
 * Server component that displays related podcast episodes.
 * Uses pillar, keyword, and title-word matching to find relevant episodes.
 * Rendered on the server for full SEO indexability.
 */
export function RelatedEpisodes({
  currentSlug,
  pillar,
  keywords,
  title,
  limit = 3,
  className = "",
}: RelatedEpisodesProps) {
  const episodes = getRelatedEpisodes(currentSlug, pillar, keywords, title, limit);

  if (episodes.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="font-heading text-2xl text-off-white mb-2 text-center">
        RELATED EPISODES
      </h3>
      <p className="text-sm text-foreground-muted text-center mb-6">
        More episodes you might enjoy
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {episodes.map((ep) => (
          <Link
            key={ep.slug}
            href={`/podcast/${ep.slug}`}
            className="
              block bg-background-elevated rounded-lg border border-white/5
              overflow-hidden group
              hover:border-coral/30 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
              transition-all h-full
            "
            style={{ transitionDuration: "var(--duration-normal)" }}
          >
            {/* Episode label strip */}
            <div className="px-5 pt-4 pb-0 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-heading text-foreground-subtle">
                Episode
              </span>
            </div>

            <div className="p-5 pt-3">
              <div className="flex items-center gap-3 mb-2">
                <Badge pillar={ep.pillar} />
                <span className="text-xs text-foreground-subtle">
                  {ep.duration}
                </span>
              </div>

              <h4 className="font-heading text-lg text-off-white mb-2 group-hover:text-coral transition-colors leading-tight">
                {ep.title.toUpperCase()}
              </h4>

              <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">
                {ep.description}
              </p>

              {ep.guest && (
                <p className="text-xs text-foreground-subtle mt-2">
                  with {ep.guest}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
