import { type ReactNode } from "react";

type SectionBackground = "charcoal" | "deep-purple" | "purple" | "coral" | "transparent";

interface SectionProps {
  children: ReactNode;
  background?: SectionBackground;
  className?: string;
  id?: string;
  grain?: boolean;
  fullHeight?: boolean;
}

const bgClasses: Record<SectionBackground, string> = {
  charcoal: "bg-charcoal",
  "deep-purple": "bg-deep-purple",
  purple: "bg-purple",
  coral: "bg-coral text-off-white",
  transparent: "bg-transparent",
};

export function Section({
  children,
  background = "charcoal",
  className = "",
  id,
  grain = false,
  fullHeight = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`
        relative py-[var(--spacing-section)] overflow-hidden
        ${bgClasses[background]}
        ${fullHeight ? "min-h-screen flex items-center" : ""}
        ${grain ? "grain-overlay" : ""}
        ${className}
      `}
    >
      {children}
    </section>
  );
}
