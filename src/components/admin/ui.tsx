import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Admin-panel UI primitives — v2, aligned with the design handoff spec.
 *
 * Design rules (enforce these):
 *  • Coral is PRIMARY-CTA only (and unread badge). Never hover, never tab
 *    active state, never link colour, never border. Use semantic good /
 *    warn / bad / info tokens for status colouring.
 *  • Uppercase is reserved for display titles (Bebas) and sidebar section
 *    labels (PERSONAL, CRM, GROWTH). Everything else is sentence case.
 *  • One focus ring utility: .focus-ring. Never hand-roll :focus styles.
 *  • Number typography is font-mono with tabular-nums.
 *
 * Tokens come from globals.css @theme — refer via Tailwind var() classes
 * (eg. bg-[var(--color-surface)]) so the designer's values stay the
 * source of truth.
 */

// ── Card ─────────────────────────────────────────────────────────

export type CardTone = "default" | "raised" | "sunken" | "danger";

const CARD_TONE_CLASSES: Record<CardTone, string> = {
  default:
    "bg-[var(--color-surface)] border border-[var(--color-border)]",
  raised:
    "bg-[var(--color-elevated)] border border-[var(--color-border-strong)] shadow-[var(--shadow-admin-raised)]",
  sunken:
    "bg-[var(--color-sunken)] border border-[var(--color-border)]",
  danger:
    "bg-[var(--color-bad-tint)] border border-[var(--color-bad)]/30",
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
      className={`rounded-[var(--radius-admin-lg)] ${CARD_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </As>
  );
}

export function CardBody({
  children,
  className = "",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return <div className={`${compact ? "p-4" : "p-6"} ${className}`}>{children}</div>;
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
      className={`flex items-start justify-between gap-3 px-6 pt-6 pb-3 ${className}`}
    >
      <div className="min-w-0">
        <h3 className="text-[length:var(--text-h3-admin)] leading-[var(--text-h3-admin--line-height)] font-body font-semibold text-[var(--color-fg)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[length:var(--text-body-sm-admin)] text-[var(--color-fg-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ── Section label — the small uppercase labels used sparingly ────

export function SectionLabel({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "fg" | "coral";
  className?: string;
}) {
  const color =
    tone === "coral"
      ? "text-[var(--color-coral)]"
      : tone === "fg"
        ? "text-[var(--color-fg)]"
        : "text-[var(--color-fg-muted)]";
  return (
    <span
      className={`font-body text-[length:var(--text-caption-admin)] uppercase tracking-[0.08em] font-semibold ${color} ${className}`}
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
        <h1
          className="font-display uppercase text-[length:var(--text-display-md)] leading-[var(--text-display-md--line-height)] text-[var(--color-fg)] tracking-[0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[length:var(--text-body-sm-admin)] text-[var(--color-fg-muted)] mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-coral)] hover:bg-[var(--color-coral-hover)] active:bg-[var(--color-coral-pressed)] text-white",
  secondary:
    "bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)]",
  outline:
    "bg-transparent hover:bg-[var(--color-elevated)] text-[var(--color-fg)] border border-[var(--color-border-strong)]",
  ghost:
    "bg-transparent hover:bg-[var(--color-elevated)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
  danger:
    "bg-transparent hover:bg-[var(--color-bad-tint)] text-[var(--color-bad)] border border-[var(--color-bad)]/30",
};

const BUTTON_SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7 px-3 text-[length:var(--text-caption-admin)]",
  md: "h-9 px-4 text-[length:var(--text-body-sm-admin)]",
  lg: "h-11 px-5 text-[length:var(--text-body-admin)]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  loading,
  type = "button",
  title,
  className = "",
  leadingIcon,
  trailingIcon,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  title?: string;
  className?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}) {
  const base = `inline-flex items-center justify-center gap-2 rounded-[var(--radius-admin-md)] font-body font-medium transition-colors duration-[var(--dur-fast)] focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {!loading && leadingIcon}
      {children}
      {!loading && trailingIcon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={base} title={title}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={base}
    >
      {content}
    </button>
  );
}

// ── Pill ─────────────────────────────────────────────────────────

export type PillTone =
  | "neutral"
  | "good"
  | "warn"
  | "bad"
  | "info"
  | "coral"
  | "stage-new"
  | "stage-triage"
  | "stage-active"
  | "stage-waiting"
  | "stage-done";

const PILL_TONES: Record<PillTone, string> = {
  neutral:
    "bg-[var(--color-elevated)] text-[var(--color-fg-muted)] border-[var(--color-border-strong)]",
  good: "bg-[var(--color-good-tint)] text-[var(--color-good)] border-[var(--color-good)]/30",
  warn: "bg-[var(--color-warn-tint)] text-[var(--color-warn)] border-[var(--color-warn)]/30",
  bad: "bg-[var(--color-bad-tint)] text-[var(--color-bad)] border-[var(--color-bad)]/30",
  info: "bg-[var(--color-info-tint)] text-[var(--color-info)] border-[var(--color-info)]/30",
  // Coral pill is the single Unread-count indicator — do not repurpose.
  coral:
    "bg-[var(--color-coral-tint)] text-[var(--color-coral)] border-[var(--color-coral)]/30",
  "stage-new":
    "bg-[var(--color-stage-new-tint)] text-[var(--color-stage-new)] border-[var(--color-stage-new)]/30",
  "stage-triage":
    "bg-[var(--color-stage-triage-tint)] text-[var(--color-stage-triage)] border-[var(--color-stage-triage)]/30",
  "stage-active":
    "bg-[var(--color-stage-active-tint)] text-[var(--color-stage-active)] border-[var(--color-stage-active)]/30",
  "stage-waiting":
    "bg-[var(--color-stage-waiting-tint)] text-[var(--color-stage-waiting)] border-[var(--color-stage-waiting)]/30",
  "stage-done":
    "bg-[var(--color-stage-done-tint)] text-[var(--color-stage-done)] border-[var(--color-stage-done)]/30",
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
      className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-[var(--radius-admin-sm)] border text-[length:var(--text-caption-admin)] font-body font-medium ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Unread count badge — the ONE place coral lives in nav/lists ──

export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} unread`}
      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-coral)] text-white font-mono tabular-nums text-[10px] font-semibold"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ── Unread dot — the small coral pip used in list rows ──────────

export function UnreadDot({
  size = "sm",
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sz =
    size === "xs" ? "w-1.5 h-1.5" : size === "md" ? "w-2.5 h-2.5" : "w-2 h-2";
  return (
    <span
      aria-label="Unread"
      className={`inline-block rounded-full bg-[var(--color-coral)] shrink-0 ${sz} ${className}`}
    />
  );
}

// ── Checkbox — styled accent using the info-blue token ──────────

export function Checkbox({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={`accent-[var(--color-info)] ${className}`}
    />
  );
}

// ── Avatar ───────────────────────────────────────────────────────

// Fixed team hues per spec — Anthony purple, Matthew blue, Wes amber,
// Sarah green. External contacts get neutral grey.
const TEAM_AVATAR_COLORS: Record<string, string> = {
  anthony: "bg-[var(--color-stage-triage)] text-white",
  ted: "bg-[var(--color-stage-triage)] text-white",
  matthew: "bg-[var(--color-info)] text-white",
  wes: "bg-[var(--color-warn)] text-[var(--color-canvas)]",
  sarah: "bg-[var(--color-good)] text-white",
};

export type AvatarSize = 20 | 24 | 28 | 36;

const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
  20: "w-5 h-5 text-[10px]",
  24: "w-6 h-6 text-[11px]",
  28: "w-7 h-7 text-[12px]",
  36: "w-9 h-9 text-[14px]",
};

export function Avatar({
  name,
  slug,
  size = 28,
  className = "",
}: {
  /** Human-readable name; first letter becomes the initial. */
  name?: string | null;
  /** Team slug — if present + matches a team member, use the fixed hue. */
  slug?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const initial = (name ?? slug ?? "?").trim()[0]?.toUpperCase() ?? "?";
  const palette = slug && TEAM_AVATAR_COLORS[slug.toLowerCase()];
  const fallback = "bg-[var(--color-elevated)] text-[var(--color-fg-muted)] border border-[var(--color-border-strong)]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-body font-semibold uppercase shrink-0 ${AVATAR_SIZE_CLASSES[size]} ${palette ?? fallback} ${className}`}
      title={name ?? slug ?? "Unassigned"}
      aria-label={name ?? slug ?? "Unassigned"}
    >
      {initial}
    </span>
  );
}

// ── Stat tile ────────────────────────────────────────────────────

export interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Optional delta string like "▲ 12.4%" — will be tinted green/red. */
  delta?: { direction: "up" | "down" | "flat"; value: string };
  tone?: "neutral" | "good" | "warn" | "bad";
  href?: string;
  loading?: boolean;
}

export function StatTile({
  label,
  value,
  sub,
  delta,
  tone = "neutral",
  href,
  loading,
}: StatTileProps) {
  const valueClass =
    tone === "good"
      ? "text-[var(--color-good)]"
      : tone === "warn"
        ? "text-[var(--color-warn)]"
        : tone === "bad"
          ? "text-[var(--color-bad)]"
          : "text-[var(--color-fg)]";

  const body = (
    <>
      <span className="block text-[length:var(--text-caption-admin)] font-body font-medium text-[var(--color-fg-muted)]">
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-8 w-24 mt-2" />
      ) : (
        <span
          className={`block mt-2 font-mono tabular-nums text-[length:var(--text-num-lg)] leading-[var(--text-num-lg--line-height)] font-medium ${valueClass}`}
        >
          {value}
        </span>
      )}
      {(sub || delta) && (
        <span className="mt-1.5 flex items-center gap-2 text-[length:var(--text-caption-admin)] text-[var(--color-fg-subtle)]">
          {delta && (
            <span
              className={`font-mono tabular-nums ${
                delta.direction === "up"
                  ? "text-[var(--color-good)]"
                  : delta.direction === "down"
                    ? "text-[var(--color-bad)]"
                    : "text-[var(--color-fg-muted)]"
              }`}
            >
              {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}{" "}
              {delta.value}
            </span>
          )}
          {sub && <span>{sub}</span>}
        </span>
      )}
    </>
  );

  const base =
    "block rounded-[var(--radius-admin-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 transition-colors duration-[var(--dur-fast)]";

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} hover:border-[var(--color-border-strong)] hover:bg-[var(--color-elevated)] focus-ring`}
      >
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

// ── Empty state ──────────────────────────────────────────────────

export function EmptyState({
  icon,
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
      className={`flex flex-col items-center text-center py-10 px-6 rounded-[var(--radius-admin-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/50 ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 mb-3 flex items-center justify-center rounded-[var(--radius-admin-md)] bg-[var(--color-elevated)] text-[var(--color-fg-muted)]">
          {icon}
        </div>
      )}
      <p className="text-[length:var(--text-body-lg-admin)] font-body font-semibold text-[var(--color-fg)]">
        {title}
      </p>
      {subtitle && (
        <p className="mt-1 max-w-sm text-[length:var(--text-body-sm-admin)] text-[var(--color-fg-muted)]">
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
  rounded = "rounded-[var(--radius-admin-md)]",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-[var(--color-elevated)] animate-pulse ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Toast ────────────────────────────────────────────────────────

export function Toast({
  message,
  tone = "neutral",
}: {
  message: ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const isError = tone === "bad";
  const toneClass =
    tone === "good"
      ? "border-[var(--color-good)]/30"
      : tone === "bad"
        ? "border-[var(--color-bad)]/30"
        : tone === "warn"
          ? "border-[var(--color-warn)]/30"
          : "border-[var(--color-border-strong)]";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-[var(--radius-admin-md)] bg-[var(--color-raised)] text-[var(--color-fg)] font-body text-[length:var(--text-body-sm-admin)] shadow-[var(--shadow-admin-toast)] border ${toneClass}`}
    >
      {message}
    </div>
  );
}

// ── Input / Select / Textarea ────────────────────────────────────

const FIELD_BASE =
  "w-full h-9 px-3 rounded-[var(--radius-admin-md)] bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] text-[length:var(--text-body-sm-admin)] font-body placeholder:text-[var(--color-fg-subtle)] focus-ring focus:border-[var(--color-border-focus)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--dur-fast)]";

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD_BASE} ${className}`} />;
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${FIELD_BASE} ${className}`}>
      {children}
    </select>
  );
}

export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${FIELD_BASE} h-auto py-2 leading-[var(--text-body-sm-admin--line-height)] ${className}`}
    />
  );
}

// ── Number display helper ────────────────────────────────────────

export function Num({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>{children}</span>
  );
}

// ── Progress bar (used on glide-path + similar) ──────────────────

export function ProgressBar({
  percent,
  className = "",
}: {
  /** 0..100 */
  percent: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 w-full rounded-full bg-[var(--color-sunken)] overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-hover)] transition-[width] duration-[var(--dur-base)] ease-[var(--ease-admin-out)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
