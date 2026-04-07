"use client";

import { usePodcastPlayer, type PlayerEpisode } from "./PodcastPlayerContext";

interface PlayButtonProps {
  episode: PlayerEpisode;
  className?: string;
  size?: "sm" | "md";
}

export function PlayButton({ episode, className = "", size = "md" }: PlayButtonProps) {
  const { currentEpisode, isPlaying, play, pause, resume } = usePodcastPlayer();
  const isThis = currentEpisode?.slug === episode.slug;
  const isThisPlaying = isThis && isPlaying;

  const handleClick = () => {
    if (isThisPlaying) {
      pause();
    } else if (isThis) {
      resume();
    } else {
      play(episode);
    }
  };

  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? 12 : 16;

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} rounded-full bg-coral flex items-center justify-center shrink-0 hover:bg-coral/80 transition-colors ${className}`}
      aria-label={isThisPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
    >
      {isThisPlaying ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="currentColor" className="text-off-white">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="currentColor" className="text-off-white ml-0.5">
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      )}
    </button>
  );
}
