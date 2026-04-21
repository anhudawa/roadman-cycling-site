import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared admin-panel UI primitives.
 *
 * Every admin page was reimplementing the same "dark elevated card with
 * coral accents" pattern by hand, with subtle padding / radius / border
 * drift. These primitives lock the design language so every page looks
 * like part of one system, and reduces the cost of future tweaks to a
 * single file.
 *
 * Colour references:
 *   bg-background          #252526 (canvas)
 *   bg-background-elevated #2E2E30 (card surfaces)
 *   border-white/5         default card edge
 *   coral                  #F16363 (primary accent)
 *   off-white              #FAFAFA (strong text)
 *   foreground-muted       #B0B0B5 (body text)
 *   foreground-subtle      #9A9A9F (meta / labels)
 */

// ── Card ─────────────────────────────────────────────────────────

export type CardTone = "default" | "coral" | "danger" | "muted";

const CARD_TONE_CLASSES: Record<CardTone, string> = {
  default: "border-white/5 bg-background-elevated",
  coral: "border-coral/20 bg-gradient-to-br from-coral/[0.04] to-transparent",
  danger: "border-red-500/20 bg-red-500/[0.04]",
  muted: "border-white/5 bg-white/[0.02]",
};

export function Card({
  children,
  tone = "default",
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  tone?: CardTone;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <As
      className={`rounded-xl border ${CARD_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </As>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  action,
  subtitle,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 px-5 pt-5 pb-3 ${className}`}
    >
      <div className="min-w-0">
        <SectionLabel>{title}</SectionLabel>
        {subtitle && (
          <p className="text-foreground-subtle text-xs mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ── Section label (the tiny uppercase headings everywhere) ───────

export function SectionLabel({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "off-white" | "coral";
  className?: string;
}) {
  const color =
    tone === "coral"
      ? "text-coral"
      : tone === "off-white"
        ? "text-off-white"
        : "text-foreground-subtle";
  return (
    <span
      className={`font-heading text-[10px] uppercase tracking-widest font-semibold ${color} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Page header ──────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="font-heading text-3xl text-off-white tracking-wider uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="text-foreground-muted text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// ── Stat tile ────────────────────────────────────────────────────

export interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "neutral" | "good" | "bad" | "coral";
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
  href,
  size = "md",
}: StatTileProps) {
  const valueTone =
    tone === "good"
      ? "text-green-400"
      : tone === "bad"
        ? "text-coral"
        : tone === "coral"
          ? "text-coral"
          : "text-off-white";
  const valueSize =
    size === "lg"
      ? "text-5xl"
      : size === "sm"
        ? "text-xl"
        : "text-3xl";

  const body = (
    <>
      <SectionLabel>{label}</SectionLabel>
      <p
        className={`font-heading tracking-wide mt-1.5 tabular-nums ${valueSize} ${valueTone}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-foreground-subtle text-xs mt-1.5">{sub}</p>
      )}
    </>
  );

  const base =
    "block rounded-xl border border-white/5 bg-background-elevated p-5 transition";

  if (href) {
    return (
      <Link href={href} className={`${base} hover:border-coral/30`}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

// ── Pill ─────────────────────────────────────────────────────────

export type PillTone =
  | "neutral"
  | "coral"
  | "good"
  | "warn"
  | "bad"
  | "info";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-white/5 text-foreground-muted border-white/10",
  coral: "bg-coral/15 text-coral border-coral/30",
  good: "bg-green-500/10 text-green-400 border-green-500/20",
  warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  bad: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function Pill({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Button (admin variant) ───────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-coral text-white hover:bg-coral/90 shadow-[0_0_12px_rgba(241,99,99,0.25)]",
  secondary:
    "bg-coral/15 text-coral border border-coral/30 hover:bg-coral/25",
  ghost:
    "text-foreground-muted hover:text-off-white hover:bg-white/5",
  outline:
    "border border-white/10 text-foreground-muted hover:text-off-white hover:border-white/30",
  danger:
    "border border-red-400/30 text-red-400 hover:bg-red-500/10",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  type = "button",
  title,
  className = "",
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  title?: string;
  className?: string;
}) {
  const sizeCls =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";
  const base = `inline-flex items-center gap-2 rounded-lg font-heading tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${sizeCls} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={base}
    >
      {children}
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────────────

export function EmptyState({
  icon = "·",
  title,
  subtitle,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-center py-10 px-6 rounded-xl border border-dashed border-white/10 ${className}`}
    >
      <div className="text-foreground-subtle/50 text-3xl mb-2">{icon}</div>
      <p className="text-off-white text-sm font-medium">{title}</p>
      {subtitle && (
        <p className="text-foreground-subtle text-xs mt-1 max-w-sm mx-auto">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton shimmer ─────────────────────────────────────────────

export function Skeleton({
  className = "",
  rounded = "rounded",
}: {
  className?: string;
  rounded?: "rounded" | "rounded-lg" | "rounded-full";
}) {
  return (
    <div
      className={`bg-white/5 animate-pulse ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Toast (floating notification) ───────────────────────────────

export function Toast({
  message,
  tone = "coral",
}: {
  message: ReactNode;
  tone?: "coral" | "good" | "bad";
}) {
  const color =
    tone === "good"
      ? "bg-green-500 text-white"
      : tone === "bad"
        ? "bg-red-500 text-white"
        : "bg-coral text-white";
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-heading tracking-wider uppercase ${color}`}
    >
      {message}
    </div>
  );
}
