import Link from "next/link";

const EPISODES_PER_PAGE = 50;

interface PodcastPaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Server-rendered pagination controls for the podcast archive.
 * All links are plain <a> elements (via Next Link) so crawlers
 * can discover every page without executing JavaScript.
 */
export function PodcastPagination({
  currentPage,
  totalPages,
}: PodcastPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Build the visible page-number sequence with ellipsis gaps.
  // Always show first, last, and a window around the current page.
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Podcast archive pagination"
      className="flex flex-col items-center gap-4 pt-10 pb-4"
    >
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous */}
        {hasPrev ? (
          <Link
            href={pageHref(currentPage - 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-off-white hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
            rel="prev"
          >
            &larr; PREV
          </Link>
        ) : (
          <span className="px-4 py-2 rounded-lg bg-white/5 text-foreground-subtle border border-white/5 text-sm font-heading tracking-wide cursor-default">
            &larr; PREV
          </span>
        )}

        {/* Page numbers */}
        {pages.map((entry, i) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-2 text-foreground-subtle text-sm select-none"
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : entry === currentPage ? (
            <span
              key={entry}
              aria-current="page"
              className="px-3.5 py-2 rounded-lg bg-coral text-off-white text-sm font-heading tracking-wide"
            >
              {entry}
            </span>
          ) : (
            <Link
              key={entry}
              href={pageHref(entry)}
              className="px-3.5 py-2 rounded-lg bg-white/5 text-foreground-muted hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
            >
              {entry}
            </Link>
          ),
        )}

        {/* Next */}
        {hasNext ? (
          <Link
            href={pageHref(currentPage + 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-off-white hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
            rel="next"
          >
            NEXT &rarr;
          </Link>
        ) : (
          <span className="px-4 py-2 rounded-lg bg-white/5 text-foreground-subtle border border-white/5 text-sm font-heading tracking-wide cursor-default">
            NEXT &rarr;
          </span>
        )}
      </div>

      <p className="text-xs text-foreground-subtle">
        Page {currentPage} of {totalPages}
      </p>
    </nav>
  );
}

/** Canonical href for a given page number. Page 1 = /podcast (no param). */
function pageHref(page: number): string {
  return page === 1 ? "/podcast" : `/podcast?page=${page}`;
}

/**
 * Build an array of page numbers and ellipsis markers.
 * Shows: 1, ..., (current-1), current, (current+1), ..., last
 */
function buildPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  // First page
  pages.push(1);

  // Left ellipsis
  if (windowStart > 2) {
    pages.push("ellipsis");
  }

  // Window around current
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (windowEnd < total - 1) {
    pages.push("ellipsis");
  }

  // Last page
  pages.push(total);

  return pages;
}

export { EPISODES_PER_PAGE };
