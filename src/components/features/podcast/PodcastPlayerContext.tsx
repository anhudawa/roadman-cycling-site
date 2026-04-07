"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface PlayerEpisode {
  slug: string;
  title: string;
  guest?: string;
  youtubeId?: string;
  spotifyId?: string;
  duration: string;
}

interface PodcastPlayerContextType {
  currentEpisode: PlayerEpisode | null;
  isPlaying: boolean;
  isMinimised: boolean;
  play: (episode: PlayerEpisode) => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
  minimise: () => void;
  expand: () => void;
}

const PodcastPlayerContext = createContext<PodcastPlayerContextType | null>(null);

export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<PlayerEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);

  const play = useCallback((episode: PlayerEpisode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setIsMinimised(false);
  }, []);

  const pause = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => setIsPlaying(true), []);

  const close = useCallback(() => {
    setCurrentEpisode(null);
    setIsPlaying(false);
    setIsMinimised(false);
  }, []);

  const minimise = useCallback(() => setIsMinimised(true), []);
  const expand = useCallback(() => setIsMinimised(false), []);

  return (
    <PodcastPlayerContext.Provider
      value={{ currentEpisode, isPlaying, isMinimised, play, pause, resume, close, minimise, expand }}
    >
      {children}
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) throw new Error("usePodcastPlayer must be used within PodcastPlayerProvider");
  return ctx;
}
