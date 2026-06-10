"use client";

import dynamic from "next/dynamic";

/**
 * Client-side loader for the game. Three.js and the game logic only
 * ship to this route, and only on the client — there's nothing to
 * server-render inside a WebGL canvas. The placeholder mirrors the
 * loader backdrop so first paint is brand-dark, never blank.
 */
const RacingIQGame = dynamic(() => import("@/components/features/racing-iq/RacingIQGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-deep-purple">
      <p className="font-heading text-sm tracking-[0.45em] text-coral">
        ROADMAN CYCLING PRESENTS
      </p>
    </div>
  ),
});

export function GameLoader() {
  return <RacingIQGame />;
}
