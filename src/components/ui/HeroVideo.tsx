"use client";

import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  /**
   * YouTube video ID (the bit after `?v=`). Pass `null` until Anthony has
   * recorded and uploaded the hero film — the component renders a designed
   * placeholder in the meantime, so the slot reads as "in production"
   * rather than "broken". Drop the ID in and it goes live, no layout change.
   */
  videoYouTubeId: string | null;
  /** Used for the iframe title and the fallback's aria-label. */
  title?: string;
  /**
   * Auto-load a muted, autoplaying embed once the player scrolls into view.
   *
   * Off by default on purpose: the heavy YouTube payload (~hundreds of KB)
   * only loads when the visitor chooses to watch, which keeps /go fast on
   * mobile 4G. Flip this on if you want the film rolling silently the moment
   * it's on screen — the overlay sound button lets the viewer unmute.
   * Honours `prefers-reduced-motion` (never auto-plays for those users).
   */
  autoplayOnScroll?: boolean;
  /** Override the poster still. Defaults to the video's YouTube thumbnail. */
  posterSrc?: string;
  className?: string;
}

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const SoundOnIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

const SoundOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="m23 9-6 6M17 9l6 6" />
  </svg>
);

/**
 * 16:9 hero video player for the /go landing page (and reusable elsewhere).
 *
 * Two states:
 *  - No ID → a cycling-themed gradient placeholder with a pulsing play badge
 *    and a "VIDEO COMING SOON" tag, sized identically to the live player so
 *    the page never reflows when the real video lands.
 *  - ID set → a lightweight facade (poster + play button) that defers the
 *    privacy-enhanced `youtube-nocookie.com` iframe until the visitor clicks
 *    (or scrolls into view, if `autoplayOnScroll`). This is the "lite embed"
 *    pattern: no YouTube JS or cookies on the page until someone watches.
 */
export function HeroVideo({
  videoYouTubeId,
  title = "Roadman Cycling",
  autoplayOnScroll = false,
  posterSrc,
  className = "",
}: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [activated, setActivated] = useState(false);
  // `startMuted` is set once at activation and never changes after, so the
  // iframe src stays stable (no reload). Unmuting flips `muted` (UI only) and
  // goes through the YouTube postMessage API, keeping playback uninterrupted.
  const [startMuted, setStartMuted] = useState(true);
  const [muted, setMuted] = useState(true);
  const [posterFallback, setPosterFallback] = useState(false);

  const activate = (startMutedValue: boolean) => {
    setStartMuted(startMutedValue);
    setMuted(startMutedValue);
    setActivated(true);
  };

  // Muted autoplay once the player enters the viewport (opt-in).
  useEffect(() => {
    if (!videoYouTubeId || !autoplayOnScroll || activated) return;
    const node = containerRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          activate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [videoYouTubeId, autoplayOnScroll, activated]);

  const postCommand = (func: "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    );
  };

  const toggleSound = () => {
    if (muted) {
      postCommand("unMute");
      setMuted(false);
    } else {
      postCommand("mute");
      setMuted(true);
    }
  };

  // ── No video yet: designed placeholder ──────────────────────────────────
  if (!videoYouTubeId) {
    return (
      <div
        role="img"
        aria-label={`${title} — hero video coming soon`}
        className={`group relative aspect-video w-full overflow-hidden rounded-2xl border border-coral/25 bg-charcoal shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${className}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-deep-purple via-charcoal to-charcoal"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,_rgba(76,18,115,0.55),_transparent_55%),radial-gradient(circle_at_78%_90%,_rgba(241,99,99,0.20),_transparent_55%)]"
        />
        {/* Faint scanlines — a "footage in the edit" texture. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
          }}
        />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-coral/40 bg-charcoal/70 px-3 py-1 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-coral/70 motion-reduce:animate-none" />
            <span className="relative h-2 w-2 rounded-full bg-coral" />
          </span>
          <span className="font-heading text-[10px] tracking-[0.3em] text-coral">
            IN PRODUCTION
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <span
            aria-hidden
            className="relative flex h-20 w-20 items-center justify-center rounded-full border border-coral/40 bg-coral/10 shadow-[0_0_36px_rgba(241,99,99,0.25)] transition-transform group-hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full border border-coral/20 animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:animate-none" />
            <PlayIcon className="relative h-8 w-8 translate-x-[2px] text-coral" />
          </span>
          <div>
            <p className="font-heading text-base tracking-[0.32em] text-off-white">
              VIDEO COMING SOON
            </p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-foreground-muted">
              Anthony&apos;s putting the finishing touches on the film.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const poster =
    posterSrc ??
    `https://i.ytimg.com/vi/${videoYouTubeId}/${
      posterFallback ? "hqdefault" : "maxresdefault"
    }.jpg`;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoYouTubeId)}` +
    `?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1` +
    `&mute=${startMuted ? 1 : 0}` +
    (origin ? `&origin=${encodeURIComponent(origin)}` : "");

  // ── Live video: facade until clicked / scrolled into view ───────────────
  return (
    <div
      ref={containerRef}
      className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-charcoal shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${className}`}
      style={{ boxShadow: "0 0 40px rgba(241,99,99,0.16)" }}
    >
      {activated ? (
        <>
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-charcoal/80 px-3 py-1.5 font-heading text-[11px] tracking-[0.2em] text-off-white backdrop-blur-sm transition-colors hover:border-coral/60 hover:text-coral"
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            {muted ? "TAP FOR SOUND" : "SOUND ON"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => activate(false)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* Plain <img> (not next/image) so the maxres → hqdefault fallback
              is a simple onError swap; the poster is decorative behind the
              overlay and i.ytimg.com is whitelisted in the CSP. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            decoding="async"
            onError={() => {
              if (!posterSrc) setPosterFallback(true);
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-charcoal/40 transition-colors group-hover:from-charcoal/70"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-coral/50 bg-coral shadow-[0_0_40px_rgba(241,99,99,0.5)] transition-transform group-hover:scale-110 md:h-20 md:w-20">
              <span className="absolute inset-0 rounded-full border border-coral/40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:animate-none" />
              <PlayIcon className="relative h-8 w-8 translate-x-[2px] text-off-white md:h-9 md:w-9" />
            </span>
          </span>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-heading text-[11px] tracking-[0.3em] text-off-white/90">
            WATCH
          </span>
        </button>
      )}
    </div>
  );
}
