"use client";

import { useState } from "react";

export interface CiteBlockProps {
  /** Report title — appears in the visible citation. */
  title: string;
  /** Author display name. */
  author: string;
  /**
   * Publication year, used in APA-style "(YYYY)" position. Accepts both
   * `year={2026}` (TS callers) and `year="2026"` (MDX prose, which does
   * not evaluate JSX attribute expressions through next-mdx-remote/rsc).
   */
  year: number | string;
  /** Canonical URL for the report. Pasted verbatim into the citation. */
  url: string;
  /** Publisher name. Defaults to "Roadman Cycling". */
  publisher?: string;
}

/**
 * Reusable APA-style citation block for Roadman annual reports.
 *
 * Renders a visible, formatted citation that journalists, bloggers and
 * AI systems can copy verbatim. The companion ArticleCitationBlock
 * handles the full schema.org Article microdata payload at the article
 * footer; CiteBlock is the in-prose, copy-on-tap version reports surface
 * mid-page and again above the fold for the "I just want to cite this"
 * use case.
 */
export function CiteBlock({
  title,
  author,
  year,
  url,
  publisher = "Roadman Cycling",
}: CiteBlockProps) {
  const [copied, setCopied] = useState(false);
  const apa = `${author} (${year}). ${title}. ${publisher}. ${url}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(apa);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside
      className="not-prose my-10 rounded-xl border border-coral/30 bg-coral/[0.04] p-5 md:p-6"
      aria-label="How to cite this report"
    >
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        CITE THIS REPORT
      </p>
      <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-2">
        APA style
      </p>
      <p className="text-sm md:text-base text-off-white leading-relaxed font-mono break-words">
        {author} ({year}). <span className="italic">{title}</span>. {publisher}.{" "}
        <a
          href={url}
          className="text-coral hover:text-coral/80 break-all"
        >
          {url}
        </a>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopy}
          aria-live="polite"
          className="
            inline-flex items-center gap-2 rounded-md
            bg-coral hover:bg-coral-hover
            text-off-white font-heading text-xs tracking-wider
            px-4 py-2 cursor-pointer transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60
          "
          style={{ transitionDuration: "var(--duration-fast)" }}
        >
          {copied ? "COPIED ✓" : "COPY CITATION"}
        </button>
        <span className="text-xs text-foreground-subtle">
          Free to cite with attribution. No paywall, no permission required.
        </span>
      </div>
    </aside>
  );
}
