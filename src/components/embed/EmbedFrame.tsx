/**
 * EmbedFrame — chrome wrapper for the public iframe-friendly calculator
 * widgets at /embed/<tool>. Provides:
 *
 *   - A compact branded header strip (Roadman wordmark + tool title).
 *   - Self-contained dark-mode styling so the widget looks identical
 *     regardless of the parent page's CSS.
 *   - A "Powered by Roadman Cycling →" attribution link in the footer
 *     that always points to the production site (third parties embed
 *     this; relative links would break their pages).
 *
 * Children render the actual calculator UI. Keep it tight — embedded
 * widgets are typically 360-640px wide.
 */

import type { ReactNode } from "react";

const ROADMAN_HOMEPAGE = "https://roadmancycling.com";

interface EmbedFrameProps {
  title: string;
  /** Optional path on the main site this embed maps to (for the footer CTA). */
  toolPath?: string;
  children: ReactNode;
  /** UTM-style source label appended to outbound links so we can attribute embed traffic. */
  utmSource?: string;
}

export function EmbedFrame({
  title,
  toolPath,
  children,
  utmSource = "embed_widget",
}: EmbedFrameProps) {
  const ctaHref = toolPath
    ? `${ROADMAN_HOMEPAGE}${toolPath}?utm_source=${utmSource}&utm_medium=embed`
    : `${ROADMAN_HOMEPAGE}/?utm_source=${utmSource}&utm_medium=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-[#252526] text-[#FAFAFA]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#210140]">
        <a
          href={`${ROADMAN_HOMEPAGE}?utm_source=${utmSource}&utm_medium=embed`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading tracking-wider text-sm text-[#FAFAFA] hover:text-[#F16363] transition-colors"
          aria-label="Roadman Cycling — open in new tab"
        >
          ROADMAN <span className="text-[#F16363]">/</span> CYCLING
        </a>
        <span className="font-heading tracking-wider text-xs text-[#B0B0B5] uppercase truncate ml-3">
          {title}
        </span>
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <footer className="px-4 py-2 border-t border-white/10 bg-[#1B1B1C]">
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] text-[#B0B0B5] hover:text-[#F16363] transition-colors text-center"
        >
          Powered by{" "}
          <span className="font-heading tracking-wider text-[#FAFAFA]">
            Roadman Cycling
          </span>{" "}
          <span aria-hidden>→</span>
        </a>
      </footer>
    </div>
  );
}
