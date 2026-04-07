"use client";

import { motion } from "framer-motion";

interface GuestEntry {
  name: string;
  credential: string;
}

/**
 * Two-row infinite scrolling marquee of notable podcast guests.
 * Rows scroll in opposite directions for visual depth.
 */
export function GuestMarquee({
  guests,
  className = "",
  fadeColor = "deep-purple",
}: {
  guests: GuestEntry[];
  className?: string;
  fadeColor?: "deep-purple" | "charcoal";
}) {
  const mid = Math.ceil(guests.length / 2);
  const row1 = guests.slice(0, mid);
  const row2 = guests.slice(mid);

  return (
    <div
      className={`relative overflow-hidden space-y-3 ${className}`}
      aria-label="Notable podcast guests"
    >
      {/* Fade edges — match section background */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r ${
          fadeColor === "deep-purple"
            ? "from-deep-purple to-transparent"
            : "from-charcoal to-transparent"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l ${
          fadeColor === "deep-purple"
            ? "from-deep-purple to-transparent"
            : "from-charcoal to-transparent"
        }`}
      />

      <MarqueeRow guests={row1} direction="left" duration={45} />
      <MarqueeRow guests={row2} direction="right" duration={50} />
    </div>
  );
}

function MarqueeRow({
  guests,
  direction,
  duration,
}: {
  guests: GuestEntry[];
  direction: "left" | "right";
  duration: number;
}) {
  const doubled = [...guests, ...guests];

  return (
    <motion.div
      className="flex gap-3 w-max"
      animate={{
        x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
      }}
      transition={{
        x: { duration, repeat: Infinity, ease: "linear" },
      }}
    >
      {doubled.map((guest, i) => (
        <div
          key={`${guest.name}-${i}`}
          className="flex-shrink-0 bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-2.5 hover:border-coral/25 transition-colors group"
        >
          <span className="font-heading text-off-white text-[13px] whitespace-nowrap block group-hover:text-coral transition-colors">
            {guest.name.toUpperCase()}
          </span>
          <span className="text-foreground-subtle text-[11px] whitespace-nowrap block">
            {guest.credential}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
