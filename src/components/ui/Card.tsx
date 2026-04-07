"use client";

import Link from "next/link";
import { useRef, type ReactNode, type MouseEvent, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CardProps {
  children: ReactNode;
  href?: string;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
  tilt?: boolean;
  tiltStrength?: number;
}

/**
 * Glassmorphism card with optional 3D perspective tilt.
 * - Glass background with animated gradient border on hover
 * - Mouse-tracking shine/reflection effect
 * - Spring-based tilt with smooth return to rest
 * - Falls back gracefully on touch devices
 */
export function Card({
  children,
  href,
  className = "",
  hoverable = true,
  glass = false,
  tilt = false,
  tiltStrength = 8,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const springConfig = { stiffness: 200, damping: 25, mass: 0.4 };
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [tiltStrength, -tiltStrength]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-tiltStrength, tiltStrength]),
    springConfig
  );

  // Shine position
  const shineX = useTransform(mouseX, [0, 1], [0, 100]);
  const shineY = useTransform(mouseY, [0, 1], [0, 100]);

  // Shine gradient (must be called at top level, not inside JSX)
  const shineBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouch || !ref.current || !hoverable) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const enableTilt = tilt && hoverable && !isTouch;

  const baseClasses = `
    relative rounded-lg overflow-hidden
    ${glass ? "glass-card" : "bg-background-elevated border border-white/5"}
    ${hoverable && !tilt ? "transition-all hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5" : ""}
    ${hoverable && glass ? "glass-card-gradient-border" : ""}
    ${className}
  `;

  const inner = (
    <>
      {children}
      {/* Mouse-tracking shine overlay */}
      {hoverable && !isTouch && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: shineBackground,
            transitionDuration: "var(--duration-normal)",
          }}
        />
      )}
    </>
  );

  if (enableTilt) {
    const tiltContent = (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
        }}
        className={`group ${baseClasses}`}
      >
        {inner}
      </motion.div>
    );

    if (href) {
      return (
        <Link href={href} className="block" style={{ perspective: "1000px" }}>
          {tiltContent}
        </Link>
      );
    }
    return <div style={{ perspective: "1000px" }}>{tiltContent}</div>;
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`block group ${baseClasses}`}
        style={{ transitionDuration: "var(--duration-normal)" }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className={`group ${baseClasses}`}
      style={{ transitionDuration: "var(--duration-normal)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {inner}
    </div>
  );
}
