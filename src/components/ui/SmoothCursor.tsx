"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

type CursorVariant = "default" | "hover" | "image" | "text" | "hidden";

/**
 * Custom cursor with shape morphing and magnetic pull.
 * - Near-instant following with stiff springs
 * - Grows/morphs on interactive elements
 * - Becomes a crosshair on images
 * - Thin line on text links
 * - Switches to white on coral/pink backgrounds
 * - Only visible on desktop with fine pointer
 */
export function SmoothCursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [onCoralBg, setOnCoralBg] = useState(false);

  // Stiff springs for near-instant response
  const springConfig = { damping: 40, stiffness: 600, mass: 0.15 };
  const cursorX = useSpring(useMotionValue(0), springConfig);
  const cursorY = useSpring(useMotionValue(0), springConfig);

  // Inner dot — slightly stiffer for parallax feel
  const dotSpringConfig = { damping: 45, stiffness: 800, mass: 0.1 };
  const dotX = useSpring(useMotionValue(0), dotSpringConfig);
  const dotY = useSpring(useMotionValue(0), dotSpringConfig);

  const getCursorVariant = useCallback((target: HTMLElement): CursorVariant => {
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest("[role='button']")
    ) {
      return "hover";
    }
    if (target.closest("img") || target.closest("video") || target.closest("[data-cursor='image']")) {
      return "image";
    }
    if (target.closest("input") || target.closest("select") || target.closest("textarea")) {
      return "text";
    }
    return "default";
  }, []);

  const rafId = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    // Use rAF to batch mouse updates to display refresh rate
    const handleMove = (e: MouseEvent) => {
      if (rafId.current) return; // skip if a frame is already pending
      rafId.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        dotX.set(e.clientX);
        dotY.set(e.clientY);
        rafId.current = 0;
      });
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setVariant(getCursorVariant(target));

      // Detect coral/pink backgrounds where the coral cursor would be invisible
      try {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (el) {
          const bg = window.getComputedStyle(el).backgroundColor;
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const [, r, g, b] = match.map(Number);
            // Detect coral-ish backgrounds (high red, lower green/blue)
            const isCoralish = r > 180 && g < 130 && b < 130;
            setOnCoralBg(isCoralish);
          } else {
            setOnCoralBg(false);
          }
        }
      } catch {
        // Non-critical — keep current state
      }
    };

    const handleOut = () => {
      setVariant("default");
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseout", handleOut, { passive: true });
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("mouseup", handleUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [cursorX, cursorY, dotX, dotY, getCursorVariant]);

  if (!isVisible) return null;

  const sizeMap: Record<CursorVariant, number> = {
    default: 32,
    hover: 56,
    image: 72,
    text: 4,
    hidden: 0,
  };

  const size = sizeMap[variant];
  const showLabel = variant === "image";

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className={`rounded-full border flex items-center justify-center ${onCoralBg ? "border-white/80" : "border-coral/60"}`}
          animate={{
            width: isClicking ? size * 0.85 : size,
            height: isClicking ? size * 0.85 : size,
            opacity: variant === "hidden" ? 0 : variant === "hover" ? 0.9 : 0.5,
            borderWidth: variant === "text" ? 0 : 1.5,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {showLabel && (
            <motion.span
              className={`text-[10px] font-body uppercase tracking-widest ${onCoralBg ? "text-white" : "text-coral"}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              View
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Inner dot (faster, creates parallax feel) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className={`rounded-full ${onCoralBg ? "bg-white" : "bg-coral"}`}
          animate={{
            width: variant === "hover" ? 6 : variant === "hidden" ? 0 : 4,
            height: variant === "hover" ? 6 : variant === "hidden" ? 0 : 4,
            opacity: variant === "hidden" || variant === "image" ? 0 : 0.9,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
    </>
  );
}
