"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number; // 0.1 = subtle, 0.5 = dramatic
  overlay?: boolean;
  overlayColor?: string;
  objectPosition?: string;
  /** Set to true for above-the-fold parallax images */
  priority?: boolean;
}

/**
 * Parallax image section $— image moves slower than scroll for depth effect.
 * Award-winning sites use this for section dividers and hero backgrounds.
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.2,
  overlay = true,
  overlayColor = "from-charcoal/70 to-charcoal/40",
  objectPosition = "center",
  priority = false,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1 + speed, 1, 1 + speed]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="100vw"
          quality={85}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
      </motion.div>
      {overlay && (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${overlayColor}`}
        />
      )}
    </div>
  );
}
