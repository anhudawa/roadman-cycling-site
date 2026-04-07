"use client";

import { PodcastPlayerProvider } from "./PodcastPlayerContext";
import { MiniPlayer } from "./MiniPlayer";
import type { ReactNode } from "react";

export function PodcastPlayerShell({ children }: { children: ReactNode }) {
  return (
    <PodcastPlayerProvider>
      {children}
      <MiniPlayer />
    </PodcastPlayerProvider>
  );
}
