"use client";

// Share controls for a Race Predictor result.
//
// Three actions, all client-side:
//   - Copy prediction URL to clipboard
//   - Download the 1080×1920 share image (the route handler at /share)
//   - Optional `navigator.share()` on mobile, when supported
//
// Kept deliberately small — no extra deps, no state library. The buttons
// match the existing `bg-coral` / `bg-white/[0.03]` pattern used elsewhere
// on the prediction page so visual weight is consistent.

import { useEffect, useState } from "react";

interface ShareButtonsProps {
  slug: string;
  courseName: string;
  predictedTimeLabel: string;
}

export function ShareButtons({
  slug,
  courseName,
  predictedTimeLabel,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const predictionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/predict/${slug}`
      : `/predict/${slug}`;
  const shareImageUrl = `/predict/${slug}/share`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(predictionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — silently noop. The
      // Download button still works as a fallback.
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title: `${courseName} — predicted ${predictedTimeLabel}`,
        text: `My Roadman Cycling race prediction: ${predictedTimeLabel} at ${courseName}.`,
        url: predictionUrl,
      });
    } catch {
      // User cancelled or share failed — nothing to surface.
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5 mb-8">
      <p className="text-coral text-xs uppercase tracking-wide mb-3">
        Share this prediction
      </p>
      <p className="text-off-white/70 text-sm mb-4">
        Drop the image in your Instagram story or WhatsApp status — link goes
        back here so mates can run their own.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-off-white text-sm font-medium rounded px-4 py-2 transition-colors"
          aria-live="polite"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
        <a
          href={shareImageUrl}
          download={`roadman-prediction-${slug}.png`}
          className="bg-coral hover:bg-coral-hover text-deep-purple text-sm font-semibold rounded px-4 py-2 transition-colors"
        >
          Download share image
        </a>
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-off-white text-sm font-medium rounded px-4 py-2 transition-colors"
          >
            Share…
          </button>
        )}
      </div>
    </div>
  );
}
