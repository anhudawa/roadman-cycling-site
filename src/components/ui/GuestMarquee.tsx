"use client";

interface GuestEntry {
  name: string;
  credential: string;
  href?: string;
}

/**
 * Two-row infinite scrolling marquee of notable podcast guests.
 * Uses CSS animations instead of JS-driven framer-motion for better
 * performance — reduces main thread work and improves CLS/INP.
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
  // Duplicate items to create seamless loop
  const doubled = [...guests, ...guests];

  return (
    <div
      className="flex gap-3 w-max marquee-row"
      style={{
        animationName: direction === "left" ? "marquee-left" : "marquee-right",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        willChange: "transform",
      }}
    >
      {doubled.map((guest, i) => {
        const Tag = guest.href ? "a" : "div";
        const linkProps = guest.href
          ? { href: guest.href, target: "_blank" as const, rel: "noopener noreferrer" }
          : {};
        return (
          <Tag
            key={`${guest.name}-${i}`}
            {...linkProps}
            className={`flex-shrink-0 bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-2.5 hover:border-coral/25 transition-colors group ${guest.href ? "cursor-pointer" : ""}`}
          >
            <span className="font-heading text-off-white text-[13px] whitespace-nowrap block group-hover:text-coral transition-colors">
              {guest.name.toUpperCase()}
            </span>
            <span className="text-foreground-subtle text-[11px] whitespace-nowrap block">
              {guest.credential}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
