"use client";

import { useEffect, useRef } from "react";
import type { WorldMoment } from "./scene";
import { RaceScene } from "./scene";

/**
 * Mounts the Three.js race world on a full-bleed canvas and keeps it
 * in sync with the game. The freeze treatment is CSS on the canvas
 * element (GPU-composited filter) — deliberately not a WebGL post
 * pass, per the mobile frame-rate floor.
 */
export function RaceWorld({
  moment,
  frozen,
  freezeShot = "iso",
  pulseKey,
  reducedMotion,
  onReady,
}: {
  moment: WorldMoment;
  frozen: boolean;
  /** Which frozen framing: the decision iso shot or the verdict wide. */
  freezeShot?: "iso" | "wide";
  /** Increment to fire a kinetic pulse (a decision landing). */
  pulseKey: number;
  reducedMotion: boolean;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RaceScene | null>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  const firstMomentRef = useRef(moment);
  const mountedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: RaceScene | null = null;
    try {
      scene = new RaceScene(canvas, { reducedMotion });
    } catch {
      // WebGL unavailable — the game continues UI-only over the
      // gradient backdrop the page already renders.
      onReadyRef.current?.();
      return;
    }
    scene.onFirstFrame = () => onReadyRef.current?.();
    scene.setMoment(firstMomentRef.current, { instant: true });
    sceneRef.current = scene;

    const parent = canvas.parentElement!;
    const resize = () => {
      scene!.setSize(parent.clientWidth, parent.clientHeight);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    return () => {
      observer.disconnect();
      scene!.dispose();
      sceneRef.current = null;
    };
    // The scene is created once; reduced-motion changes require reload anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return; // initial moment applied at construction
    }
    sceneRef.current?.setMoment(moment);
  }, [moment]);

  useEffect(() => {
    if (frozen) sceneRef.current?.freeze(freezeShot);
    else sceneRef.current?.unfreeze();
  }, [frozen, freezeShot]);

  useEffect(() => {
    if (pulseKey > 0) sceneRef.current?.pulse();
  }, [pulseKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full transition-[filter] duration-1000"
      style={{
        filter: frozen ? "saturate(0.35) contrast(1.06) brightness(0.82)" : "none",
      }}
    />
  );
}
