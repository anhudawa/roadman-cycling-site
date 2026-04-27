"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics/events";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface Props {
  href: string;
  children: ReactNode;
  source?: string;
  size?: Size;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral hover:bg-coral-hover text-off-white shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)]",
  secondary: "bg-purple hover:bg-purple-hover text-off-white",
  ghost:
    "bg-transparent hover:bg-white/5 text-off-white border border-white/20 hover:border-white/40",
  outline:
    "bg-transparent hover:bg-coral/10 text-coral border border-coral hover:border-coral-hover",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 md:px-10 py-4 text-lg",
};

/**
 * Opens the Skool community in a new tab AND fires a `skool_trial` event so
 * the admin dashboard's Skool Trials stat reflects real click-through volume.
 * Fire-and-forget: never blocks the click, never shows errors to the user.
 */
export function SkoolTrialButton({
  href,
  children,
  source,
  size = "md",
  variant = "primary",
  className = "",
}: Props) {
  function handleClick() {
    try {
      const payload = {
        type: "skool_trial" as const,
        page:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/community/clubhouse",
        referrer:
          typeof document !== "undefined" ? document.referrer || undefined : undefined,
        source: source ?? "clubhouse_cta",
        meta: { href },
      };
      // keepalive lets the request survive a tab switch / navigation.
      void fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
      // Fan out the same click as a funnel event so the acquisition
      // dashboard's Community Signup stage and CTA-source breakdowns
      // stay accurate without a second backend hop.
      track("community_cta_clicked", {
        destination: "skool",
        placement: source ?? "clubhouse_cta",
      });
    } catch {
      // Never block the click on a tracking failure.
    }
  }

  const classes = `
    inline-flex items-center justify-center gap-2
    font-heading tracking-wider uppercase
    rounded-md transition-all cursor-pointer
    active:scale-[0.97] active:duration-75
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={classes}
      style={{ transitionDuration: "var(--duration-fast)" }}
    >
      {children}
    </a>
  );
}
