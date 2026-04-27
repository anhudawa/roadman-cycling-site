interface Chapter {
  timestamp: string;
  title: string;
}

interface EpisodeChaptersProps {
  chapters: Chapter[];
  youtubeId?: string;
  className?: string;
}

/**
 * HH:MM:SS or MM:SS → seconds. Returns null for malformed values
 * so the row can fall back to a non-link.
 */
function timestampToSeconds(stamp: string): number | null {
  const parts = stamp.split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

/**
 * Author-curated chapter markers. When a YouTube ID is present each
 * chapter deep-links into the player at the chapter's timecode via
 * the `t=` query param — same UX as YouTube's own chapters strip,
 * but indexable by Google because it lives in the page DOM.
 *
 * Distinct from segmented transcript anchors (those are auto-generated
 * from text chunks). Chapters reflect the episode's narrative beats
 * and double as a visible TOC for the page.
 */
export function EpisodeChapters({
  chapters,
  youtubeId,
  className = "",
}: EpisodeChaptersProps) {
  if (!chapters || chapters.length === 0) return null;

  return (
    <section aria-label="Episode chapters" className={className}>
      <h2 className="font-heading text-xl text-off-white mb-4 tracking-wide">
        CHAPTERS
      </h2>
      <ol className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5 overflow-hidden">
        {chapters.map((c, i) => {
          const secs = timestampToSeconds(c.timestamp);
          const href =
            youtubeId && secs !== null
              ? `https://www.youtube.com/watch?v=${youtubeId}&t=${secs}s`
              : null;
          const inner = (
            <>
              <span className="font-mono text-xs text-coral tracking-wider w-16 shrink-0 tabular-nums">
                {c.timestamp}
              </span>
              <span className="text-sm text-foreground-muted group-hover:text-off-white transition-colors flex-1">
                {c.title}
              </span>
            </>
          );
          return (
            <li key={i}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 group hover:bg-coral/5 transition-colors"
                >
                  {inner}
                  <span
                    aria-hidden
                    className="text-coral text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    PLAY →
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-4 px-4 py-3">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export { timestampToSeconds };
