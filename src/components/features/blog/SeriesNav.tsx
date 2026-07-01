import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

interface SeriesNavProps {
  /** All posts in the series, in order. */
  seriesPosts: BlogPostMeta[];
  /** The current post's slug. */
  currentSlug: string;
  /** Human-readable series title, e.g. "Zone 2 Deep Dive". */
  seriesTitle: string;
  className?: string;
}

/**
 * "Part X of Y" navigation component for multi-part content series.
 *
 * Renders a compact nav block showing the series title, current position,
 * and prev/next links. Designed for dark backgrounds (charcoal section).
 */
export function SeriesNav({
  seriesPosts,
  currentSlug,
  seriesTitle,
  className = "",
}: SeriesNavProps) {
  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) return null;

  const total = seriesPosts.length;
  const partNumber = currentIndex + 1;
  const prev = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const next =
    currentIndex < total - 1 ? seriesPosts[currentIndex + 1] : null;

  return (
    <nav
      aria-label={`${seriesTitle} series navigation`}
      className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 ${className}`}
    >
      {/* Series header */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading text-coral text-xs tracking-[0.3em]">
          SERIES
        </p>
        <span className="text-xs text-foreground-subtle font-heading tracking-wider">
          PART {partNumber} OF {total}
        </span>
      </div>

      <p className="font-heading text-off-white text-base md:text-lg leading-snug mb-4">
        {seriesTitle.toUpperCase()}
      </p>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/10 mb-5">
        <div
          className="h-1 rounded-full bg-coral transition-all"
          style={{ width: `${(partNumber / total) * 100}%` }}
        />
      </div>

      {/* Prev / Next links */}
      <div className="flex flex-col sm:flex-row gap-3">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="
              flex-1 flex items-center gap-3 p-3 rounded-lg
              bg-white/[0.03] border border-white/5
              hover:bg-white/[0.07] hover:border-coral/30
              transition-all group
            "
          >
            <span
              aria-hidden="true"
              className="shrink-0 text-coral font-heading text-lg"
            >
              &larr;
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-foreground-subtle font-heading tracking-widest mb-0.5">
                PREVIOUS
              </p>
              <p className="text-sm text-foreground-muted group-hover:text-off-white transition-colors truncate">
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="
              flex-1 flex items-center gap-3 p-3 rounded-lg
              bg-white/[0.03] border border-white/5
              hover:bg-white/[0.07] hover:border-coral/30
              transition-all group text-right
            "
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-foreground-subtle font-heading tracking-widest mb-0.5">
                NEXT
              </p>
              <p className="text-sm text-foreground-muted group-hover:text-off-white transition-colors truncate">
                {next.title}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 text-coral font-heading text-lg"
            >
              &rarr;
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
