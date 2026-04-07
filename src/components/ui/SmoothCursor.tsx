"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

type CursorVariant = "default" | "hover" | "image" | "text" | "hidden";

/**
 * Custom cursor with shape morphing and magnetic pull.
 * - Smooth spring-lerped following (cursor trails behind mouse)
 * - Grows/morphs on interactive elements
 * - Becomes a crosshair on images
 * - Thin line on text links
 * - Only visible on desktop with fine pointer
 */
export function SmoothCursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springConfig = { damping: 28, stiffness: 250, mass: 0.4 };
  const cursorX = useSpring(useMotionValue(0), springConfig);
  const cursorY = useSpring(useMotionValue(0), springConfig);

  // Faster inner dot for parallax effect
  const dotSpringConfig = { damping: 35, stiffness: 400, mass: 0.2 };
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
      return "hidden";
    }
    return "default";
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const handleMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setVariant(getCursorVariant(target));
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
          className="rounded-full border border-coral/60 flex items-center justify-center"
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
              className="text-[10px] text-coral font-body uppercase tracking-widest"
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
          className="rounded-full bg-coral"
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
