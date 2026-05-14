"use client";

import { useState } from "react";
import type {
  TrainingPeaksAssignmentRow,
  TrainingPeaksAssignmentStatus,
} from "@/lib/crm/trainingpeaks-assignments";

const STATUS_OPTIONS: TrainingPeaksAssignmentStatus[] = [
  "pending",
  "active",
  "completed",
  "cancelled",
];

function statusClass(status: TrainingPeaksAssignmentStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "active":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "completed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "cancelled":
      return "bg-white/5 text-foreground-muted border-white/10";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ContactTrainingPeaksSection({
  initial,
}: {
  initial: TrainingPeaksAssignmentRow[];
}) {
  const [rows, setRows] = useState(initial);

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
          TrainingPeaks
        </p>
        {rows.length > 0 && (
          <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
            {rows.length} {rows.length === 1 ? "assignment" : "assignments"}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-foreground-subtle">
          No plan assignments. The Method onboarding quiz writes one when a rider
          picks a plan.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <AssignmentRow
              key={r.id}
              row={r}
              onChange={(next) =>
                setRows((prev) => prev.map((x) => (x.id === next.id ? next : x)))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AssignmentRow({
  row,
  onChange,
}: {
  row: TrainingPeaksAssignmentRow;
  onChange: (r: TrainingPeaksAssignmentRow) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState(row.status);
  const [draftAthleteId, setDraftAthleteId] = useState(row.tpAthleteId ?? "");
  const [draftStartDate, setDraftStartDate] = useState(row.planStartDate ?? "");

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/trainingpeaks-assignments/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draftStatus,
          tpAthleteId: draftAthleteId.trim() || null,
          planStartDate: draftStartDate || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Request failed (${res.status})`);
      }
      const j = await res.json();
      onChange(j.assignment as TrainingPeaksAssignmentRow);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-[var(--radius-admin-md)] border border-[var(--color-border)] bg-[var(--color-sunken)] p-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm text-off-white truncate">{row.planName}</p>
          <p className="text-[11px] text-foreground-subtle">
            Start: {formatDate(row.planStartDate)} · Assigned{" "}
            {formatDate(row.createdAt)}
            {row.assignedBy ? ` · by ${row.assignedBy}` : ""}
          </p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${statusClass(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      </div>

      {!editing ? (
        <div className="flex items-center justify-between gap-3 text-[11px] text-foreground-subtle">
          <span>
            TP athlete ID:{" "}
            <span className="text-foreground-muted">
              {row.tpAthleteId ?? "—"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-body font-semibold text-foreground-muted hover:text-off-white hover:underline"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="block text-[11px] text-foreground-subtle">
            Status
            <select
              value={draftStatus}
              onChange={(e) =>
                setDraftStatus(e.target.value as TrainingPeaksAssignmentStatus)
              }
              className="mt-1 w-full bg-[var(--color-raised)] border border-white/10 rounded px-2 py-1 text-sm text-off-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] text-foreground-subtle">
            TP athlete ID
            <input
              type="text"
              value={draftAthleteId}
              onChange={(e) => setDraftAthleteId(e.target.value)}
              placeholder="e.g. 1234567"
              className="mt-1 w-full bg-[var(--color-raised)] border border-white/10 rounded px-2 py-1 text-sm text-off-white"
            />
          </label>
          <label className="block text-[11px] text-foreground-subtle">
            Plan start date
            <input
              type="date"
              value={draftStartDate}
              onChange={(e) => setDraftStartDate(e.target.value)}
              className="mt-1 w-full bg-[var(--color-raised)] border border-white/10 rounded px-2 py-1 text-sm text-off-white"
            />
          </label>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="font-body font-semibold text-[12px] px-3 py-1 rounded border border-white/10 bg-[var(--color-raised)] text-off-white hover:border-white/20 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraftStatus(row.status);
                setDraftAthleteId(row.tpAthleteId ?? "");
                setDraftStartDate(row.planStartDate ?? "");
                setError(null);
              }}
              disabled={busy}
              className="font-body font-semibold text-[12px] px-3 py-1 rounded text-foreground-muted hover:text-off-white hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
