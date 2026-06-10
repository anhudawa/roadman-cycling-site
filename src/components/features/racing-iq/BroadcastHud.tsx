"use client";

import Image from "next/image";
import { MatchesMeter } from "./MatchesMeter";

/**
 * Persistent broadcast chrome: the Roadman bug top-left, the race
 * clock top-right, the matches meter bottom-left. Styled like a TV
 * graphics package, not a game HUD.
 */
export function BroadcastHud({
  km,
  totalKm,
  kicker,
  matches,
  muted,
  onToggleMute,
  onBurn,
}: {
  km: number;
  totalKm: number;
  kicker: string | null;
  matches: number;
  muted: boolean;
  onToggleMute: () => void;
  onBurn?: () => void;
}) {
  return (
    <>
      {/* Broadcast bug */}
      <div className="pointer-events-none absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
        <div className="border border-off-white/60 px-2.5 py-1.5">
          <Image
            src="/images/logo-white.png"
            alt="Roadman Cycling"
            width={86}
            height={24}
            className="h-5 w-auto opacity-90 sm:h-6"
            priority
          />
        </div>
      </div>

      {/* Race clock */}
      <div className="pointer-events-none absolute right-4 top-4 z-30 flex flex-col items-end gap-1.5 sm:right-6 sm:top-6">
        <div className="bg-charcoal/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="whitespace-nowrap font-heading text-lg leading-none tracking-[0.12em] text-off-white sm:text-xl">
            KM {km}
            <span className="text-off-white/45"> / {totalKm}</span>
          </p>
        </div>
        {kicker && (
          <p className="riq-kicker-in max-w-[70vw] truncate bg-coral px-2 py-0.5 font-heading text-[11px] tracking-[0.22em] text-off-white sm:text-xs">
            {kicker}
          </p>
        )}
      </div>

      {/* Matches meter */}
      <div className="absolute bottom-4 left-4 z-30 sm:bottom-6 sm:left-6">
        <div className="bg-charcoal/70 px-3 py-2 backdrop-blur-sm">
          <p className="mb-1 font-heading text-[10px] tracking-[0.28em] text-off-white/60">
            MATCHES
          </p>
          <MatchesMeter matches={matches} onBurn={onBurn} />
        </div>
      </div>

      {/* Mute */}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        aria-pressed={muted}
        className="absolute bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center border border-off-white/25 bg-charcoal/70 text-off-white/80 backdrop-blur-sm transition-colors hover:border-off-white/60 hover:text-off-white sm:bottom-6 sm:right-6"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.59 3 2.7-2.7-1.42-1.42-2.7 2.71-2.7-2.7-1.42 1.41 2.71 2.7-2.7 2.7 1.41 1.42 2.7-2.71 2.7 2.7 1.42-1.41-2.7-2.7z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </>
  );
}
