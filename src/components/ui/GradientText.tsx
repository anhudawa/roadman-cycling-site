"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

/**
 * Text with an animated gradient shimmer that plays once on scroll into view.
 */
export function GradientText({
  children,
  className = "",
  as: Tag = "span",
}: GradientTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
    >
      <motion.span
        style={{
          backgroundImage: `linear-gradient(
            90deg,
            var(--color-off-white) 0%,
            var(--color-coral) 40%,
            var(--color-off-white) 60%,
            var(--color-off-white) 100%
          )`,
          backgroundSize: "250% 100%",
          backgroundPosition: isInView ? "100% center" : "0% center",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transition: "background-position 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
          // inline-block so the element's paint box wraps its content (important
          // when children use a larger font-size via inline style $€” with plain
          // `inline` the outer box stays at the parent font-size and the
          // background-clip:text gradient only fills a sliver of the glyphs,
          // making the heading look cut off vertically). The wrapped text inside
          // still breaks normally on narrow viewports.
          display: "inline-block",
          // Ensure the inline-block participates in the baseline like the
          // surrounding inline text it replaces.
          verticalAlign: "baseline",
          // Allow the hero heading to wrap on very narrow viewports rather than
          // forcing horizontal overflow (inline-block doesn't prevent inner
          // wrapping, but this makes the intent explicit).
          maxWidth: "100%",
        }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
