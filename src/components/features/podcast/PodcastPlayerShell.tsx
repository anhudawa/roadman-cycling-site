"use client";

import dynamic from "next/dynamic";
import { PodcastPlayerProvider } from "./PodcastPlayerContext";
import type { ReactNode } from "react";

// MiniPlayer pulls in YouTube IFrame plumbing, intervals, and a couple
// hundred lines of UI that only ever runs after the user clicks "play".
// Splitting it out keeps it out of the initial JS chunk on every route.
const MiniPlayer = dynamic(
  () => import("./MiniPlayer").then((mod) => mod.MiniPlayer),
  { ssr: false },
);

export function PodcastPlayerShell({ children }: { children: ReactNode }) {
  return (
    <PodcastPlayerProvider>
      {children}
      <MiniPlayer />
    </PodcastPlayerProvider>
  );
}
