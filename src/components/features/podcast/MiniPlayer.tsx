"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePodcastPlayer } from "./PodcastPlayerContext";

export function MiniPlayer() {
  const pathname = usePathname();
  const { currentEpisode, isPlaying, isMinimised, pause, resume, close, minimise, expand } =
    usePodcastPlayer();
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as Record<string, unknown>).YT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- YT API ready check
      setApiReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    (window as unknown as Record<string, { (): void }>).onYouTubeIframeAPIReady = () => setApiReady(true);
  }, []);

  // Create/update player when episode changes
  useEffect(() => {
    if (!apiReady || !currentEpisode?.youtubeId) return;

    // Destroy previous player
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    }

    const container = containerRef.current;
    if (!container) return;

    // Create a fresh div for the player
    const playerDiv = document.createElement("div");
    playerDiv.id = "mini-yt-player";
    container.innerHTML = "";
    container.appendChild(playerDiv);

    playerRef.current = new YT.Player("mini-yt-player", {
      videoId: currentEpisode.youtubeId,
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (e: YT.PlayerEvent) => {
          e.target.playVideo();
          setTotalDuration(e.target.getDuration());
        },
        onStateChange: (e: YT.OnStateChangeEvent) => {
          if (e.data === YT.PlayerState.ENDED) {
            pause();
            setProgress(100);
          }
        },
      },
    });
  }, [apiReady, currentEpisode?.youtubeId, currentEpisode, pause]);

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    } catch { /* player not ready */ }
  }, [isPlaying]);

  // Track progress
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying || !playerRef.current) return;

    intervalRef.current = setInterval(() => {
      try {
        const player = playerRef.current;
        if (!player) return;
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        if (dur > 0) {
          setProgress((cur / dur) * 100);
          setCurrentTime(cur);
          setTotalDuration(dur);
        }
      } catch { /* noop */ }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  if (!currentEpisode) return null;
  // Public embed routes render inside third-party iframes — the floating
  // mini player has no place there.
  if (pathname?.startsWith("/embed")) return null;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || totalDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(pct * totalDuration, true);
    setProgress(pct * 100);
    setCurrentTime(pct * totalDuration);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9998] transition-transform duration-300 ${
        isMinimised ? "translate-y-[calc(100%-48px)]" : "translate-y-0"
      }`}
    >
      {/* Progress bar — always visible at top edge */}
      <div
        className="h-1 bg-white/10 cursor-pointer group"
        onClick={handleProgressClick}
        role="progressbar"
        aria-label="Playback progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-coral transition-[width] duration-1000 ease-linear group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-deep-purple/95 backdrop-blur-xl border-t border-white/10 px-4 md:px-6">
        {/* Minimised strip */}
        {isMinimised && (
          <button
            onClick={expand}
            className="w-full h-12 flex items-center justify-between text-sm"
            aria-label={`Expand player: ${currentEpisode.title}`}
          >
            <span className="text-off-white font-heading truncate mr-4">
              {currentEpisode.title}
            </span>
            <span className="text-coral text-xs shrink-0">TAP TO EXPAND</span>
          </button>
        )}

        {/* Expanded player */}
        {!isMinimised && (
          <div className="py-3 flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? pause : resume}
              className="w-10 h-10 rounded-full bg-coral flex items-center justify-center shrink-0 hover:bg-coral/80 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-off-white">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-off-white ml-0.5">
                  <path d="M4 2.5v11l10-5.5z" />
                </svg>
              )}
            </button>

            {/* Episode info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/podcast/${currentEpisode.slug}`}
                className="text-off-white font-heading text-sm leading-tight hover:text-coral transition-colors truncate block"
              >
                {currentEpisode.title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                {currentEpisode.guest && (
                  <span className="text-foreground-muted text-xs truncate">
                    {currentEpisode.guest}
                  </span>
                )}
                <span className="text-foreground-subtle text-xs shrink-0">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>
            </div>

            {/* Minimise */}
            <button
              onClick={minimise}
              className="text-foreground-muted hover:text-off-white transition-colors p-1"
              aria-label="Minimise player"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7l5 5 5-5" />
              </svg>
            </button>

            {/* Close */}
            <button
              onClick={close}
              className="text-foreground-muted hover:text-coral transition-colors p-1"
              aria-label="Close player"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l10 10M14 4L4 14" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Hidden YouTube player — audio only */}
      <div ref={containerRef} className="absolute -left-[9999px] w-px h-px overflow-hidden" />
    </div>
  );
}
