"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export interface ContactRow {
  id: number;
  email: string;
  name: string | null;
  owner: string | null;
  lifecycleStage: string;
  tags: string[];
  lastActivityAt: string | null;
  createdAt: string;
  score?: number | null;
}

type ScoreBand = "hot" | "warm" | "cool" | "cold";
function getBand(score: number): ScoreBand {
  if (score >= 250) return "hot";
  if (score >= 120) return "warm";
  if (score >= 50) return "cool";
  return "cold";
}
function bandClass(b: ScoreBand): string {
  switch (b) {
    case "hot":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "warm":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "cool":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "cold":
    default:
      return "bg-slate-600/20 text-slate-400 border-slate-600/30";
  }
}

const OWNERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60_000);
  const h = Math.floor(diffMs / 3_600_000);
  const dys = Math.floor(diffMs / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dys < 7) return `${dys}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function lastActivityClass(dateStr: string | null): string {
  if (!dateStr) return "text-amber-400";
  const d = new Date(dateStr);
  const days = (Date.now() - d.getTime()) / 86_400_000;
  if (days > 14) return "text-amber-400";
  return "text-foreground-muted";
}

function stageBadgeClass(stage: string): string {
  switch (stage) {
    case "customer":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "qualified":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "contacted":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "churned":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-foreground-muted border-white/10";
  }
}

export function ContactsTable({ rows }: { rows: ContactRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [openPopover, setOpenPopover] = useState<"assign" | "tag" | null>(null);
  const [assignOwner, setAssignOwner] = useState<string>("");
  const [tagValue, setTagValue] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);

  const allOnPageSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected.has(r.id)),
    [rows, selected]
  );

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const r of rows) next.delete(r.id);
      } else {
        for (const r of rows) next.add(r.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setOpenPopover(null);
    setMsg(null);
  }

  async function applyAssign() {
    if (selected.size === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/crm/contacts/bulk/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: Array.from(selected),
          owner: assignOwner === "" ? null : assignOwner,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Assign failed");
      setMsg(`Updated ${data.count} contacts`);
      setOpenPopover(null);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setBusy(false);
    }
  }

  async function applyTag() {
    if (selected.size === 0) return;
    const tag = tagValue.trim().toLowerCase();
    if (!tag) {
      setMsg("Enter a tag");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/crm/contacts/bulk/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selected), tag }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Tag failed");
      setMsg(`Tagged ${data.count} contacts`);
      setTagValue("");
      setOpenPopover(null);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Tag failed");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    if (selected.size === 0) return;
    const ids = Array.from(selected).join(",");
    window.location.href = `/api/admin/crm/contacts/bulk/export?ids=${encodeURIComponent(ids)}`;
  }

  const selectionCount = selected.size;

  return (
    <>
      {selectionCount > 0 && (
        <div className="sticky top-0 z-20 mb-3 bg-[var(--color-raised)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-lg)] p-3 flex items-center gap-3 flex-wrap shadow-[var(--shadow-admin-raised)]">
          <span className="text-sm text-[var(--color-fg)]">
            <span className="text-[var(--color-fg)] font-semibold font-mono tabular-nums">{selectionCount}</span> selected
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline-offset-2 hover:underline"
          >
            Clear
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === "assign" ? null : "assign")}
              className="px-3 py-1.5 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-raised)]"
            >
              Assign owner...
            </button>
            {openPopover === "assign" && (
              <div className="absolute left-0 mt-2 z-30 bg-background-elevated border border-white/10 rounded-lg p-3 min-w-[220px] shadow-xl">
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
                  Owner
                </label>
                <select
                  value={assignOwner}
                  onChange={(e) => setAssignOwner(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
                >
                  {OWNERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setOpenPopover(null)}
                    className="px-2 py-1 text-xs text-foreground-muted hover:text-off-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyAssign}
                    disabled={busy}
                    className="px-3 py-1 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)] disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === "tag" ? null : "tag")}
              className="px-3 py-1.5 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-raised)]"
            >
              Add tag...
            </button>
            {openPopover === "tag" && (
              <div className="absolute left-0 mt-2 z-30 bg-background-elevated border border-white/10 rounded-lg p-3 min-w-[240px] shadow-xl">
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. cohort-2026"
                  className="w-full px-2 py-1.5 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyTag();
                  }}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setOpenPopover(null)}
                    className="px-2 py-1 text-xs text-foreground-muted hover:text-off-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyTag}
                    disabled={busy}
                    className="px-3 py-1 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)] disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="px-3 py-1.5 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-raised)]"
          >
            Export CSV
          </button>
          {msg && <span className="text-xs text-[var(--color-fg-muted)]">{msg}</span>}
        </div>
      )}

      <div className="bg-background-elevated rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02]">
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
              <th className="px-3 py-3 font-medium w-8">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  aria-label="Select all on page"
                  className="accent-coral cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 font-medium">Name / Email</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium text-right">Score</th>
              <th className="px-4 py-3 font-medium text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const tags = Array.isArray(c.tags) ? c.tags : [];
              const isSel = selected.has(c.id);
              return (
                <tr
                  key={c.id}
                  className={`border-t border-[var(--color-border)] transition-colors ${
                    isSel ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.email}`}
                      className="accent-coral cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contacts/${c.id}`} className="block">
                      <div className="text-off-white font-medium">{c.name ?? c.email}</div>
                      <div className="text-xs text-foreground-subtle">{c.email}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contacts/${c.id}`} className="block">
                      {c.owner ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-foreground-muted capitalize">
                          {c.owner}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground-subtle">—</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contacts/${c.id}`} className="block">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border capitalize ${stageBadgeClass(c.lifecycleStage)}`}
                      >
                        {c.lifecycleStage}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contacts/${c.id}`} className="flex flex-wrap gap-1">
                      {tags.length === 0 ? (
                        <span className="text-xs text-foreground-subtle">—</span>
                      ) : (
                        tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-elevated)] text-[var(--color-fg-muted)] border border-[var(--color-border-strong)]"
                          >
                            {t}
                          </span>
                        ))
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/contacts/${c.id}`} className="inline-block">
                      {typeof c.score === "number" ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border tabular-nums uppercase tracking-widest ${bandClass(getBand(c.score))}`}
                          title={`Score ${c.score}`}
                        >
                          {c.score} · {getBand(c.score)}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground-subtle">—</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/contacts/${c.id}`}
                      className={`text-xs ${lastActivityClass(c.lastActivityAt)}`}
                    >
                      {formatRelative(c.lastActivityAt ?? c.createdAt)}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
