"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

/**
 * Custom cursor that follows mouse with smooth spring physics.
 * Shows a coral ring that scales up on interactive elements.
 * Only visible on desktop (pointer: fine).
 */
export function SmoothCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    // Only show on desktop with fine pointer
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const handleMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea")
      ) {
        setIsHovering(true);
      }
    };

    const handleOut = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        className="rounded-full border-2 border-coral"
        animate={{
          width: isHovering ? 48 : 16,
          height: isHovering ? 48 : 16,
          opacity: isHovering ? 0.8 : 0.5,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </motion.div>
  );
}
