"use client";

import Link from "next/link";
import { type ReactNode } from "react";

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
 * Card with optional glass effect.
 * Uses CSS-only hover transitions for zero JS overhead.
 */
export function Card({
  children,
  href,
  className = "",
  hoverable = true,
  glass = false,
  tilt = false,
}: CardProps) {
  const baseClasses = `
    relative rounded-lg overflow-hidden
    ${glass ? "glass-card" : "bg-background-elevated border border-white/5"}
    ${hoverable ? "transition-all hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5" : ""}
    ${hoverable && glass ? "glass-card-gradient-border" : ""}
    ${className}
  `;

  if (href) {
    return (
      <Link
        href={href}
        className={`block group ${baseClasses}`}
        style={{ transitionDuration: "var(--duration-normal)" }}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={`group ${baseClasses}`}
      style={{ transitionDuration: "var(--duration-normal)" }}
    >
      {children}
    </div>
  );
}
