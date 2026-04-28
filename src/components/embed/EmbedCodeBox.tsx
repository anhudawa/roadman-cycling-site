"use client";

/**
 * EmbedCodeBox — copy-to-clipboard snippet shown beside each embed on the
 * /embed landing page. Renders the iframe HTML, a copy button, and a
 * preview link. Self-contained client component — no external deps.
 */

import { useState } from "react";

interface EmbedCodeBoxProps {
  /** Iframe `src` URL (absolute). */
  src: string;
  /** Suggested width — accepts CSS sizes (e.g. "100%", "480px"). */
  width: string;
  /** Suggested height in pixels. */
  height: number;
  /** Title used in the iframe's `title` attribute (a11y). */
  title: string;
  /** Optional preview URL to view the embed standalone (defaults to src). */
  previewUrl?: string;
}

function buildSnippet(src: string, width: string, height: number, title: string) {
  const w = /^\d+$/.test(width) ? `${width}px` : width;
  return [
    `<iframe`,
    `  src="${src}"`,
    `  title="${title}"`,
    `  width="${w}"`,
    `  height="${height}"`,
    `  style="border:0;border-radius:12px;max-width:100%;display:block;"`,
    `  loading="lazy"`,
    `  referrerpolicy="no-referrer-when-downgrade"`,
    `></iframe>`,
  ].join("\n");
}

export function EmbedCodeBox({
  src,
  width,
  height,
  title,
  previewUrl,
}: EmbedCodeBoxProps) {
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(src, width, height, title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers/contexts where clipboard API is unavailable —
      // surface the snippet by selecting it so the user can copy manually.
      const textarea = document.createElement("textarea");
      textarea.value = snippet;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#1B1B1C]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs uppercase tracking-wider text-foreground-muted">
          Embed code
        </span>
        <div className="flex items-center gap-2">
          <a
            href={previewUrl ?? src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground-muted hover:text-coral underline-offset-2 hover:underline"
          >
            Preview
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-heading tracking-wider px-3 py-1 rounded-md bg-coral hover:bg-coral-hover text-off-white transition-colors"
            aria-live="polite"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="px-4 py-3 text-[12px] leading-relaxed text-foreground-muted overflow-x-auto whitespace-pre">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
