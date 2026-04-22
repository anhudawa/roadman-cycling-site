"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface TaskRow {
  id: number;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
  assignedTo: string | null;
  contactId: number | null;
  contactName: string | null;
  contactEmail: string | null;
}

function dueClass(dueAt: string | null, completed: boolean): string {
  if (completed) return "text-foreground-subtle line-through";
  if (!dueAt) return "text-foreground-subtle";
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (due < now) return "text-red-400";
  if (due <= today.getTime()) return "text-amber-400";
  return "text-foreground-muted";
}

function formatDue(dueAt: string | null): string {
  if (!dueAt) return "—";
  const d = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d >= today && d < tomorrow) return `Today ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initial(slug: string | null): string {
  if (!slug) return "?";
  return slug.charAt(0).toUpperCase();
}

export function TasksTable({ rows }: { rows: TaskRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<number | null>(null);

  async function toggleComplete(id: number, completed: boolean) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/crm/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setUpdating(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-foreground-subtle bg-background-elevated rounded-xl border border-white/5">
        <p className="text-lg font-heading tracking-wider">NO TASKS</p>
        <p className="text-sm mt-1">Click &ldquo;Add task&rdquo; to create one.</p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]">
          <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
            <th className="px-4 py-3 font-medium w-10"></th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 font-medium text-right">Assigned</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const completed = !!t.completedAt;
            return (
              <tr
                key={t.id}
                className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors ${
                  updating === t.id || pending ? "opacity-60" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleComplete(t.id, completed)}
                    disabled={updating === t.id}
                    aria-label={completed ? "Mark incomplete" : "Mark complete"}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      completed
                        ? "bg-[var(--color-good)] border-[var(--color-good)]"
                        : "border-[var(--color-border-strong)] hover:border-[var(--color-fg)]"
                    }`}
                  >
                    {completed && (
                      <svg className="w-3 h-3 text-off-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {t.contactId ? (
                    <Link href={`/admin/contacts/${t.contactId}`} className={`block ${completed ? "line-through text-foreground-subtle" : "text-off-white"}`}>
                      {t.title}
                    </Link>
                  ) : (
                    <span className={completed ? "line-through text-foreground-subtle" : "text-off-white"}>{t.title}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {t.contactId ? (
                    <Link href={`/admin/contacts/${t.contactId}`} className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:underline">
                      {t.contactName ?? t.contactEmail ?? `#${t.contactId}`}
                    </Link>
                  ) : (
                    <span className="text-xs text-foreground-subtle">—</span>
                  )}
                </td>
                <td className={`px-4 py-3 text-xs ${dueClass(t.dueAt, completed)}`}>
                  {formatDue(t.dueAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-elevated)] text-[var(--color-fg)] text-[11px] font-bold capitalize border border-[var(--color-border-strong)]"
                    title={t.assignedTo ?? "unassigned"}
                  >
                    {initial(t.assignedTo)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
