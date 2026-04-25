"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { segmentTranscript, type TranscriptSegment } from "@/lib/transcript";

interface TranscriptViewerProps {
  transcript: string;
  /** Optional chapter-title overrides, 1:1 aligned with the emitted segments. */
  titles?: string[];
  className?: string;
}

/**
 * Semantic transcript renderer.
 *
 * The transcript is always in the DOM (inside a default-open `<details>` so
 * users can collapse it $€” but it is fully indexable even when collapsed per
 * Google's rendering model).
 *
 * The key SEO upgrade over the previous "wall of paragraphs" version:
 * every transcript is split into topic-sized `<section>` blocks with
 * `<h3 id="segment-N">` anchors, which gives each episode ~6$€“10 deep-linkable
 * long-tail landing targets rather than a single flat page.
 */
export function TranscriptViewer({
  transcript,
  titles,
  className = "",
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const segments = useMemo<TranscriptSegment[]>(
    () => segmentTranscript(transcript, { titles }),
    [transcript, titles],
  );

  // Derive match count straight from state $€” no effect needed.
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const matches = transcript.match(regex);
    return matches?.length ?? 0;
  }, [searchQuery, transcript]);

  const highlightText = useCallback(
    (text: string): React.ReactNode => {
      if (!searchQuery.trim()) return text;

      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(regex);

      if (parts.length === 1) return text;

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-coral/30 text-off-white rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      );
    },
    [searchQuery],
  );

  if (segments.length === 0) return null;

  return (
    <details
      ref={detailsRef}
      open
      className={`group rounded-xl border border-white/5 bg-background-elevated overflow-hidden ${className}`}
      aria-label="Episode transcript"
    >
      <summary
        className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-white/[0.02] transition-colors"
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-coral shrink-0"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="font-heading text-lg text-off-white tracking-wide">
            EPISODE TRANSCRIPT
          </span>
          <span className="text-xs text-foreground-subtle font-body tracking-widest">
            {segments.length} SECTIONS
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-foreground-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>

      <div className="border-t border-white/5">
        {/* Segment jump-links $€” each link targets a stable h3#segment-N anchor
            inside the transcript. Exposes the segment structure to crawlers
            and gives real users a fast way to skim. */}
        <nav
          aria-label="Transcript sections"
          className="px-6 py-4 border-b border-white/5 bg-white/[0.01]"
        >
          <p className="text-xs text-foreground-subtle uppercase tracking-widest font-heading mb-3">
            Jump to section
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0.5">
            {segments.map((segment) => (
              <li key={segment.id}>
                <a
                  href={`#${segment.id}`}
                  className="group/jump flex items-baseline gap-3 py-1.5 px-2 -mx-2 rounded-md text-sm text-foreground-muted hover:bg-coral/10 hover:text-off-white transition-colors"
                  style={{ transitionDuration: "var(--duration-fast)" }}
                >
                  <span className="text-coral font-heading text-xs tabular-nums shrink-0 w-6">
                    {String(segment.index).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{segment.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              aria-label="Search transcript"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-off-white placeholder:text-foreground-subtle font-body focus:outline-none focus:border-coral/40 focus:ring-1 focus:ring-coral/20 transition-colors"
              style={{ transitionDuration: "var(--duration-fast)" }}
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-foreground-subtle">
                  {matchCount} {matchCount === 1 ? "match" : "matches"}
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-foreground-subtle hover:text-off-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transcript body $€” semantic sections with h3 anchors */}
        <div ref={contentRef} className="px-6 py-6 scrollbar-thin">
          <div
            className="space-y-8 transcript-body"
            data-speakable-transcript="true"
          >
            {segments.map((segment) => (
              <section
                key={segment.id}
                id={segment.id}
                aria-labelledby={`${segment.id}-heading`}
                className="scroll-mt-24"
              >
                <h3
                  id={`${segment.id}-heading`}
                  className="font-heading text-base text-off-white mb-3 tracking-wide"
                >
                  <a
                    href={`#${segment.id}`}
                    className="hover:text-coral transition-colors no-underline"
                  >
                    <span className="text-coral mr-2" aria-hidden="true">
                      {segment.index}.
                    </span>
                    {segment.title}
                  </a>
                </h3>
                <p className="font-body text-foreground-muted text-sm leading-relaxed">
                  {highlightText(segment.text)}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
