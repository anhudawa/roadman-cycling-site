"use client";

import Link from "next/link";
import { useState } from "react";

interface TagUsage {
  tag: string;
  count: number;
}

interface Props {
  initialTags: TagUsage[];
}

export function TagsClient({ initialTags }: Props) {
  const [tags, setTags] = useState<TagUsage[]>(initialTags);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "err" } | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/crm/tags", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { tags: TagUsage[] };
      setTags(data.tags);
    }
  }

  function flash(text: string, tone: "ok" | "err" = "ok") {
    setMsg({ text, tone });
    setTimeout(() => setMsg(null), 3500);
  }

  function toggle(tag: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function doRename(oldName: string) {
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      setRenaming(null);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/crm/tags/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old: oldName, new: newName }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        touched?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Rename failed", "err");
      } else {
        flash(`Renamed on ${data.touched ?? 0} contacts`);
        setRenaming(null);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function doDelete(name: string) {
    if (!confirm(`Delete tag "${name}" from all contacts? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/crm/tags/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        touched?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Delete failed", "err");
      } else {
        flash(`Removed from ${data.touched ?? 0} contacts`);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function doMerge() {
    const target = mergeTarget.trim();
    const sources = Array.from(selected);
    if (!target || sources.length === 0) {
      flash("Pick at least one tag and enter a target name", "err");
      return;
    }
    if (!confirm(`Merge ${sources.length} tag(s) into "${target}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/crm/tags/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, target }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        touched?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Merge failed", "err");
      } else {
        flash(`Merged on ${data.touched ?? 0} contacts`);
        setSelected(new Set());
        setMergeTarget("");
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {msg && (
        <div
          className={`mb-4 px-3 py-2 rounded text-xs border ${
            msg.tone === "err"
              ? "border-red-400/30 bg-red-500/10 text-red-300"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 p-3 rounded-lg bg-background-elevated border border-[var(--color-border-strong)]">
          <span className="text-xs uppercase tracking-widest text-foreground-subtle">
            {selected.size} selected
          </span>
          <span className="text-xs text-foreground-muted">Merge into:</span>
          <input
            type="text"
            value={mergeTarget}
            onChange={(e) => setMergeTarget(e.target.value)}
            placeholder="target tag name"
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm bg-background-deep border border-white/10 rounded text-off-white placeholder:text-foreground-subtle focus-ring focus:border-[var(--color-border-focus)]/60"
          />
          <button
            type="button"
            onClick={doMerge}
            disabled={busy || !mergeTarget.trim()}
            className="px-3 py-1.5 text-xs uppercase tracking-wider rounded bg-[var(--color-bad-tint)] border border-[var(--color-border-strong)] text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)] disabled:opacity-50"
          >
            Merge
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 text-xs uppercase tracking-wider rounded border border-white/10 text-foreground-muted hover:text-off-white"
          >
            Clear
          </button>
        </div>
      )}

      <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
              <th className="px-3 py-2 w-10"></th>
              <th className="px-3 py-2">Tag</th>
              <th className="px-3 py-2 w-24">Count</th>
              <th className="px-3 py-2 w-56 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-foreground-subtle">
                  No tags yet. Tags are added from the contact detail page.
                </td>
              </tr>
            )}
            {tags.map((t) => {
              const isRenaming = renaming === t.tag;
              const isChecked = selected.has(t.tag);
              return (
                <tr key={t.tag} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(t.tag)}
                      className="accent-coral"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") doRename(t.tag);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          className="px-2 py-1 text-sm bg-background-deep border border-white/10 rounded text-off-white focus-ring focus:border-[var(--color-border-focus)]/60"
                        />
                        <button
                          type="button"
                          onClick={() => doRename(t.tag)}
                          disabled={busy}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-[var(--color-bad-tint)] border border-[var(--color-border-strong)] text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenaming(null)}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider rounded border border-white/10 text-foreground-muted hover:text-off-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/admin/contacts?tag=${encodeURIComponent(t.tag)}`}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-off-white hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)] transition-colors"
                      >
                        {t.tag}
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2 text-foreground-muted tabular-nums">{t.count}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    {!isRenaming && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRenaming(t.tag);
                            setRenameValue(t.tag);
                          }}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider rounded border border-white/10 text-foreground-muted hover:text-off-white hover:border-white/30"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => doDelete(t.tag)}
                          disabled={busy}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider rounded border border-red-400/20 text-red-300/80 hover:text-red-300 hover:border-red-400/50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
