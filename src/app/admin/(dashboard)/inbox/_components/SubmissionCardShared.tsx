"use client";

/**
 * Shared building blocks for the Submissions kanban — used by both the
 * Contact-form board (InboxPipelineBoard) and the /apply board
 * (PipelineBoard) so the two views look and feel like the same system.
 *
 * Design goals (v2, post-mobile audit):
 *  • Flat columns (no double card nesting). Column is just "header + list".
 *  • Stage-specific accent colour for each column header — coral reserved
 *    for primary actions and unread only.
 *  • 72vw columns on mobile so there's ALWAYS a peek of the next column
 *    telling the user to swipe — paired with edge fades.
 *  • Sentence-case column labels; uppercase only on tab pills + CTAs.
 *  • Single-line message preview (scannable in 1 beat; full text in modal).
 *  • "Move" dropdown on each card so stage changes work on touch (HTML5
 *    drag-and-drop is broken on iOS/Android).
 *  • Larger tap targets (owner avatar + move + open) — 36–40px min.
 */

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

// ── Owner avatar ─────────────────────────────────────────────────

// Per design spec: avatars use the per-stage accent palette, NOT coral.
// Anthony = triage-purple, Matthew = info-blue, Wes = warn-amber, Sarah = good-green.
const OWNER_COLORS: Record<string, string> = {
  anthony:
    "bg-[var(--color-stage-triage-tint)] text-[var(--color-stage-triage)] border-[var(--color-stage-triage)]/40",
  ted: "bg-[var(--color-stage-triage-tint)] text-[var(--color-stage-triage)] border-[var(--color-stage-triage)]/40",
  matthew:
    "bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/40",
  wes:
    "bg-[var(--color-warn)]/15 text-[var(--color-warn)] border-[var(--color-warn)]/40",
  sarah:
    "bg-[var(--color-good)]/15 text-[var(--color-good)] border-[var(--color-good)]/40",
};

export function OwnerAvatar({
  slug,
  size = "md",
}: {
  slug: string | null | undefined;
  size?: "sm" | "md";
}) {
  // Enlarged to 32px/28px for finger-friendly hit areas on touch devices.
  const dim = size === "md" ? "w-8 h-8 text-[11px]" : "w-7 h-7 text-[10px]";
  if (!slug) {
    return (
      <span
        className={`${dim} rounded-full border border-dashed border-white/20 flex items-center justify-center text-foreground-subtle font-heading`}
        title="Unassigned"
        aria-label="Unassigned"
      >
        ?
      </span>
    );
  }
  const classes = OWNER_COLORS[slug.toLowerCase()] ?? "bg-white/10 text-off-white border-white/20";
  return (
    <span
      className={`${dim} rounded-full border flex items-center justify-center font-heading uppercase font-semibold ${classes}`}
      title={slug}
      aria-label={slug}
    >
      {slug.charAt(0)}
    </span>
  );
}

// ── Contact avatar from name ─────────────────────────────────────

export function NameAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  // Stable but non-specific tint per name — just use name length mod to pick.
  // No coral here — contacts get neutral / stage-accent tints only. Coral
  // is reserved for primary CTA + unread badge per the design spec.
  const palette = [
    "bg-[var(--color-stage-triage-tint)] text-[var(--color-stage-triage)]",
    "bg-[var(--color-info)]/15 text-[var(--color-info)]",
    "bg-[var(--color-good)]/15 text-[var(--color-good)]",
    "bg-[var(--color-warn)]/15 text-[var(--color-warn)]",
    "bg-white/[0.08] text-off-white",
  ];
  const tint = palette[(name.length + initial.charCodeAt(0)) % palette.length];
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <span
      className={`${dim} rounded-full flex items-center justify-center font-heading uppercase font-semibold ${tint}`}
    >
      {initial}
    </span>
  );
}

// ── Column wrapper ───────────────────────────────────────────────

export function Column({
  stage,
  label,
  accent,
  stripeColor,
  count,
  isHoverTarget,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  stage: string;
  label: string;
  /** CSS classes for the dot (eg "bg-[var(--color-stage-waiting)]"). */
  accent: string;
  /** Background colour class used for the 2px stage stripe. */
  stripeColor?: string;
  count: number;
  isHoverTarget: boolean;
  children: ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      data-stage={stage}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`shrink-0 w-[72vw] sm:w-72 snap-start flex flex-col rounded-[var(--radius-md)] transition ${
        isHoverTarget
          ? "bg-white/[0.04] ring-1 ring-white/15"
          : ""
      }`}
    >
      {/* 2px stage stripe per spec — carries the per-stage accent without coral. */}
      <span
        aria-hidden="true"
        className={`h-[2px] rounded-t-[var(--radius-md)] ${
          stripeColor ?? accent
        }`}
      />
      {/* Flat column header — no double card nesting. */}
      <div
        className={`flex items-center gap-2 px-2 pt-2 pb-2 border-b ${
          count === 0 ? "border-white/[0.04]" : "border-white/10"
        }`}
      >
        <h3 className="font-body font-semibold text-off-white text-[13px] tracking-normal">
          {label}
        </h3>
        <span
          className={`ml-auto min-w-[20px] text-center text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
            count === 0
              ? "text-foreground-subtle"
              : "text-off-white bg-white/[0.06]"
          }`}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 pt-2 px-1 pb-2 space-y-2 min-h-[60px]">{children}</div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────

export function SubmissionCard({
  headline,
  subline,
  preview,
  rightChip,
  unread,
  dragging,
  ringAccent = "ring-[var(--color-border-focus)]",
  onClick,
  draggableProps,
  footerSlot,
}: {
  /** Top-line: contact name / applicant name. */
  headline: string;
  /** Second line: subject, persona/cohort tag, or metadata. Hide if empty. */
  subline?: ReactNode;
  /** Single-line preview of message body / goal — line-clamp-1, full text in modal. */
  preview?: string;
  /** Chip — typically a relative timestamp — rendered bottom-right. */
  rightChip?: ReactNode;
  unread?: boolean;
  dragging?: boolean;
  ringAccent?: string;
  onClick?: () => void;
  draggableProps?: {
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
  };
  /** Footer content. Consumer is responsible for MoveMenu / OwnerPopover / etc. */
  footerSlot?: ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      {...draggableProps}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative rounded-lg bg-white/[0.035] hover:bg-white/[0.06] transition cursor-pointer sm:cursor-grab sm:active:cursor-grabbing
        border border-white/[0.08] hover:border-white/20
        ${unread ? "border-l-2 border-l-[var(--color-fg)]" : ""}
        ${dragging ? `opacity-40 scale-[0.98] ring-2 ${ringAccent}` : ""}
      `}
    >
      <div className="px-3 pt-2.5 pb-2 space-y-1.5">
        {/* Line 1: name + (subject) */}
        <div className="flex items-start gap-2.5">
          <NameAvatar name={headline} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-off-white text-[13px] font-semibold leading-tight truncate">
              {headline}
            </p>
            {subline && (
              <p className="text-foreground-subtle text-[11px] leading-tight truncate mt-0.5">
                {subline}
              </p>
            )}
          </div>
        </div>

        {/* Preview — one line; user opens modal for full text */}
        {preview && (
          <p className="text-foreground-muted text-[12px] leading-snug truncate pl-[38px]">
            {preview}
          </p>
        )}

        {/* Footer: Move + Owner (via footerSlot) + timestamp */}
        {(footerSlot || rightChip) && (
          <div className="flex items-center gap-2 pl-[38px] pt-1 min-h-[28px]">
            {footerSlot}
            {rightChip && (
              <span className="text-foreground-subtle text-[10px] whitespace-nowrap shrink-0 ml-auto">
                {rightChip}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Move-to-stage menu (touch fallback for drag-and-drop) ───────

export interface MoveStage {
  value: string;
  label: string;
}

export function MoveMenu({
  currentStage,
  stages,
  onMove,
  busy,
}: {
  currentStage: string;
  stages: MoveStage[];
  onMove: (value: string) => void;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={busy}
        aria-label="Move to stage"
        title="Move"
        className={`inline-flex items-center gap-1 h-7 px-2 rounded-full text-[10px] font-heading tracking-wider uppercase border border-white/10 text-foreground-muted hover:text-off-white hover:border-white/25 transition ${
          busy ? "opacity-60" : ""
        }`}
      >
        Move
        <svg
          className="w-2.5 h-2.5"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <span
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 left-0 bottom-full mb-1 min-w-[150px] rounded-lg border border-white/10 bg-background-elevated shadow-xl p-1 flex flex-col gap-0.5"
        >
          {stages
            .filter((s) => s.value !== currentStage)
            .map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onMove(s.value);
                }}
                className="text-left text-[12px] px-2.5 py-2 rounded hover:bg-white/5 text-off-white"
              >
                {s.label}
              </button>
            ))}
        </span>
      )}
    </span>
  );
}

// ── Owner-assign popover ────────────────────────────────────────

export interface OwnerOption {
  value: string | null;
  label: string;
}

export function OwnerPopover({
  options,
  selected,
  open,
  onToggle,
  onPick,
  anchor = "bottom-right",
  busy = false,
  children,
}: {
  options: OwnerOption[];
  selected: string | null;
  open: boolean;
  onToggle: () => void;
  onPick: (value: string | null) => void;
  anchor?: "bottom-right" | "top-right";
  busy?: boolean;
  /** The element that triggers the popover (usually an OwnerAvatar). */
  children: ReactNode;
}) {
  const [keyboardOpen] = useState(open);
  void keyboardOpen;
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }
      }}
      className={`relative inline-flex ${busy ? "opacity-60" : ""}`}
    >
      {children}
      {open && (
        <span
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-20 min-w-[140px] rounded-lg border border-white/10 bg-background-elevated shadow-lg p-1 flex flex-col gap-0.5 ${
            anchor === "top-right"
              ? "right-0 bottom-full mb-1"
              : "right-0 top-full mt-1"
          }`}
        >
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(opt.value);
                }}
                className={`text-left text-[11px] px-2 py-1.5 rounded hover:bg-white/5 ${
                  isSelected ? "text-[var(--color-bad)]" : "text-off-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}
