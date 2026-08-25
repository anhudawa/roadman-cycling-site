import Link from "next/link";
import { getBlogArchiveHref } from "@/lib/seo/blog-archive-pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Crawlable archive navigation. Every numbered page is an ordinary link so
 * articles remain discoverable without JavaScript or sitemap-only crawling.
 */
export function BlogPagination({
  currentPage,
  totalPages,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Cycling article archive pagination"
      className="flex flex-col items-center gap-4 pt-10 pb-4"
    >
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {currentPage > 1 ? (
          <Link
            href={getBlogArchiveHref(currentPage - 1)}
            rel="prev"
            className="px-4 py-2 rounded-lg bg-white/5 text-off-white hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
          >
            &larr; PREV
          </Link>
        ) : (
          <span className="px-4 py-2 rounded-lg bg-white/5 text-foreground-subtle border border-white/5 text-sm font-heading tracking-wide cursor-default">
            &larr; PREV
          </span>
        )}

        {pages.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
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
              href={getBlogArchiveHref(entry)}
              className="px-3.5 py-2 rounded-lg bg-white/5 text-foreground-muted hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
            >
              {entry}
            </Link>
          ),
        )}

        {currentPage < totalPages ? (
          <Link
            href={getBlogArchiveHref(currentPage + 1)}
            rel="next"
            className="px-4 py-2 rounded-lg bg-white/5 text-off-white hover:bg-coral/20 hover:text-coral border border-white/10 hover:border-coral/30 transition-colors text-sm font-heading tracking-wide"
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

function buildPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  if (windowStart > 2) pages.push("ellipsis");
  for (let page = windowStart; page <= windowEnd; page += 1) pages.push(page);
  if (windowEnd < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}
