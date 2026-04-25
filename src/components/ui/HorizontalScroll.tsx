"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * Horizontal scroll section $€” content moves horizontally as you scroll vertically.
 * A signature pattern from award-winning sites (Immersive Garden, Locomotive, etc.)
 */
export function HorizontalScroll({
  children,
  className = "",
}: HorizontalScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <section ref={targetRef} className={`relative h-[300vh] ${className}`}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div className="flex gap-6" style={{ x }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
