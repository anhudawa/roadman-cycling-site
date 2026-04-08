"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface TranscriptViewerProps {
  transcript: string;
  className?: string;
}

/**
 * Collapsible transcript viewer with in-text search.
 * Uses <details>/<summary> for SEO — transcript text is always in the HTML.
 */
export function TranscriptViewer({
  transcript,
  className = "",
}: TranscriptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Split transcript into paragraphs (roughly every 3-4 sentences or double newline)
  const paragraphs = formatTranscript(transcript);

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
        )
      );
    },
    [searchQuery]
  );

  // Count matches when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchCount(0);
      return;
    }
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const matches = transcript.match(regex);
    setMatchCount(matches?.length ?? 0);
  }, [searchQuery, transcript]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <details
      ref={detailsRef}
      className={`group rounded-xl border border-white/5 bg-background-elevated overflow-hidden ${className}`}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
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

        {/* Transcript body */}
        <div
          ref={contentRef}
          className="px-6 py-6 max-h-[60vh] overflow-y-auto scrollbar-thin"
        >
          <div className="space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-foreground-muted text-sm leading-relaxed"
              >
                {highlightText(paragraph)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

/**
 * Break a wall-of-text transcript into readable paragraphs.
 * Splits on existing double newlines, or inserts breaks roughly every 3-4 sentences.
 */
function formatTranscript(text: string): string[] {
  // If the text already has paragraph breaks, use them
  const existingParagraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  if (existingParagraphs.length > 1) {
    return existingParagraphs.map((p) => p.trim());
  }

  // Otherwise, split single block into chunks of ~3 sentences
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g);
  if (!sentences || sentences.length <= 3) {
    return [text.trim()];
  }

  const paragraphs: string[] = [];
  const chunkSize = 3;
  for (let i = 0; i < sentences.length; i += chunkSize) {
    paragraphs.push(sentences.slice(i, i + chunkSize).join("").trim());
  }
  return paragraphs;
}
