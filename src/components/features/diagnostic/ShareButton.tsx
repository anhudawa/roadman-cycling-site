"use client";

import { useState } from "react";

/**
 * Results-page share control. Copies the URL to clipboard and falls
 * back to a native Twitter compose intent so the user can blast the
 * profile name and a link with one tap.
 */
export function ShareButton({
  slug,
  profileLabel,
}: {
  slug: string;
  profileLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/diagnostic/${slug}`
      : `/diagnostic/${slug}`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `I'm apparently ${profileLabel}. Who knew. Roadman Cycling's Masters Plateau Diagnostic: `
  )}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fall back to manual selection $€” do nothing, user can still
      // grab the URL from the browser bar
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm rounded-md bg-white/5 border border-white/10 text-foreground-muted hover:text-off-white hover:bg-white/10 px-4 py-2 cursor-pointer transition-colors"
      >
        {copied ? "$œ“ Link copied" : "Copy link"}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm rounded-md bg-white/5 border border-white/10 text-foreground-muted hover:text-off-white hover:bg-white/10 px-4 py-2 cursor-pointer transition-colors"
      >
        Share on X
      </a>
    </div>
  );
}
