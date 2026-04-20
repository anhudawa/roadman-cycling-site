import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /**
   * Conversion-tracking identifier. When set, the global click delegate in
   * `src/components/analytics/Tracker.tsx` fires a `cta_click` event with
   * `track_id = dataTrack` and the destination href. Use stable, semantic
   * identifiers like `triathlon_pillar_apply_cta` — they feed attribution
   * reporting.
   */
  dataTrack?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
  external?: boolean;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-coral hover:bg-coral-hover text-off-white shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)]",
  secondary:
    "bg-purple hover:bg-purple-hover text-off-white",
  ghost:
    "bg-transparent hover:bg-white/5 text-off-white border border-white/20 hover:border-white/40",
  outline:
    "bg-transparent hover:bg-coral/10 text-coral border border-coral hover:border-coral-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 md:px-10 py-4 text-lg",
};

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    dataTrack,
  } = props;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-heading tracking-wider uppercase
    rounded-md transition-all cursor-pointer
    active:scale-[0.97] active:duration-75
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  const trackAttr = dataTrack ? { "data-track": dataTrack } : {};

  if ("href" in props && props.href) {
    const { href, external } = props;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          style={{ transitionDuration: "var(--duration-fast)" }}
          {...trackAttr}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={baseClasses}
        style={{ transitionDuration: "var(--duration-fast)" }}
        {...trackAttr}
      >
        {children}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = props as ButtonAsButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ transitionDuration: "var(--duration-fast)" }}
      {...trackAttr}
    >
      {children}
    </button>
  );
}
