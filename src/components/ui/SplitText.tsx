"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";

type SplitMode = "letters" | "words";

interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  mode?: SplitMode;
  delay?: number;
  staggerChildren?: number;
  duration?: number;
  once?: boolean;
}

/**
 * Award-worthy split-text animation.
 * Reveals text letter-by-letter or word-by-word with stagger on scroll.
 * Uses clip-path + y-transform for a clean reveal from below.
 */
export function SplitText({
  text,
  className = "",
  style: styleProp,
  as: Tag = "h2",
  mode = "words",
  delay = 0,
  staggerChildren = 0.03,
  duration = 0.5,
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefers-reduced-motion subscription
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion) {
    return <Tag className={className} style={styleProp}>{text}</Tag>;
  }

  const items =
    mode === "letters" ? text.split("") : text.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: "110%",
      opacity: 0,
      rotateX: 45,
    },
    visible: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{ perspective: "600px", ...styleProp }}
    >
      <motion.span
        className="inline"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        aria-label={text}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-block overflow-hidden"
            style={{ verticalAlign: "top" }}
          >
            <motion.span
              className="inline-block"
              variants={itemVariants}
              style={{ transformOrigin: "bottom center" }}
            >
              {item === " " ? "\u00A0" : item}
            </motion.span>
            {mode === "words" && i < items.length - 1 && "\u00A0"}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
