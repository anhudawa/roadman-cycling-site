import Link from "next/link";
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  href?: string;
  className?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  href,
  className = "",
  hoverable = true,
}: CardProps) {
  const baseClasses = `
    relative bg-background-elevated rounded-lg border border-white/5
    overflow-hidden
    ${
      hoverable
        ? "transition-all hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5"
        : ""
    }
    ${className}
  `;

  if (href) {
    return (
      <Link
        href={href}
        className={`block ${baseClasses}`}
        style={{ transitionDuration: "var(--duration-normal)" }}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={baseClasses}
      style={{ transitionDuration: "var(--duration-normal)" }}
    >
      {children}
    </div>
  );
}
