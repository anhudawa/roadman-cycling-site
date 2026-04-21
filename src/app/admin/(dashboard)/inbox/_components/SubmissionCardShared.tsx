"use client";

/**
 * Shared building blocks for the Submissions kanban — used by both the
 * Contact-form board (InboxPipelineBoard) and the /apply board
 * (PipelineBoard) so the two views look and feel like the same system.
 *
 * Design goals:
 *  • Dense but breathable card — name, preview, timestamp, owner at a glance
 *  • Unread indicator is a coral left border (more scannable than a tiny dot)
 *  • Avatar initials circle replaces the "Unassigned" pill for visual weight
 *  • Column header has enough contrast to locate in peripheral vision
 *  • Columns snap to 85vw on mobile so one is fully visible + peek of next
 */

import { useState, type KeyboardEvent, type ReactNode } from "react";

// ── Owner avatar ─────────────────────────────────────────────────

const OWNER_COLORS: Record<string, string> = {
  anthony: "bg-coral/20 text-coral border-coral/40",
  ted: "bg-coral/20 text-coral border-coral/40",
  sarah: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  wes: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  matthew: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export function OwnerAvatar({
  slug,
  size = "sm",
}: {
  slug: string | null | undefined;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "w-7 h-7 text-[11px]" : "w-6 h-6 text-[10px]";
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
  const palette = [
    "bg-coral/15 text-coral",
    "bg-purple-500/15 text-purple-300",
    "bg-blue-500/15 text-blue-300",
    "bg-green-500/15 text-green-400",
    "bg-amber-500/15 text-amber-400",
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
  count,
  isHoverTarget,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  stage: string;
  label: string;
  /** CSS classes for the dot (eg "bg-coral"). */
  accent: string;
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
      className={`shrink-0 w-[85vw] sm:w-72 snap-start flex flex-col rounded-xl border bg-background-elevated/70 transition ${
        isHoverTarget
          ? "border-coral/60 ring-2 ring-coral/30"
          : count === 0
            ? "border-white/[0.04]"
            : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className={`w-2 h-2 rounded-full ${accent}`} />
        <h3 className="font-heading tracking-wider uppercase text-off-white text-xs">
          {label}
        </h3>
        <span
          className={`ml-auto min-w-[22px] text-center text-[11px] font-heading tabular-nums px-1.5 py-0.5 rounded-full ${
            count === 0
              ? "text-foreground-subtle bg-white/[0.04]"
              : "text-off-white bg-white/10"
          }`}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[88px]">{children}</div>
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
  ringAccent = "ring-coral",
  ownerSlug,
  onClick,
  draggableProps,
  footerSlot,
}: {
  /** Top-line: contact name / applicant name. */
  headline: string;
  /** Second line: subject, persona/cohort tag, or metadata. Hide if empty. */
  subline?: ReactNode;
  /** Three-line preview (message body / goal / frustration). */
  preview?: string;
  /** Top-right chip — typically a relative timestamp. */
  rightChip?: ReactNode;
  unread?: boolean;
  dragging?: boolean;
  ringAccent?: string;
  /** Owner slug — renders a small avatar in the bottom-right. */
  ownerSlug?: string | null;
  onClick?: () => void;
  draggableProps?: {
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
  };
  /** Optional extra elements at the bottom of the card (e.g. tags, persona pill). */
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
      className={`group relative rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition cursor-grab active:cursor-grabbing
        border border-white/10 hover:border-coral/40
        ${unread ? "border-l-2 border-l-coral" : ""}
        ${dragging ? `opacity-40 scale-[0.98] ring-2 ${ringAccent}` : ""}
      `}
    >
      <div className="px-3 py-3 space-y-1.5">
        {/* Line 1: avatar + name + timestamp */}
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
          {rightChip && (
            <span className="text-foreground-subtle text-[10px] whitespace-nowrap mt-0.5 shrink-0">
              {rightChip}
            </span>
          )}
        </div>

        {/* Preview paragraph */}
        {preview && (
          <p className="text-foreground-muted text-[12px] leading-snug line-clamp-2 pl-[38px]">
            {preview}
          </p>
        )}

        {/* Footer row */}
        {(footerSlot || ownerSlug !== undefined) && (
          <div className="flex items-center gap-2 pl-[38px] pt-1">
            {footerSlot}
            {ownerSlug !== undefined && (
              <span className="ml-auto">
                <OwnerAvatar slug={ownerSlug} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
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
                  isSelected ? "text-coral" : "text-off-white"
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
