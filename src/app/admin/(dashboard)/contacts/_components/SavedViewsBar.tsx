"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SavedViewRow } from "@/lib/crm/saved-views";

function filtersToQuery(filters: Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  return p.toString();
}

export function SavedViewsBar({
  views,
  currentUserSlug,
  currentFilters,
}: {
  views: SavedViewRow[];
  currentUserSlug: string;
  currentFilters: Record<string, string>;
}) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const cleaned: Record<string, string> = {};
      for (const [k, v] of Object.entries(currentFilters)) {
        if (v) cleaned[k] = v;
      }
      const res = await fetch("/api/admin/crm/saved-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          entity: "contacts",
          filters: cleaned,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      setName("");
      setShowInput(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Failed to save");
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this view?")) return;
    const res = await fetch(`/api/admin/crm/saved-views/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete");
    }
  }

  function applyView(v: SavedViewRow) {
    const qs = filtersToQuery(v.filters);
    router.push(`/admin/contacts${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="font-body font-semibold text-[13px] text-[var(--color-fg)]">
        Views:
      </span>
      {views.length === 0 && (
        <span className="text-xs text-foreground-subtle italic">No saved views yet</span>
      )}
      {views.map((v) => {
        const isOwner = v.createdBySlug === currentUserSlug;
        return (
          <span
            key={v.id}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-elevated)] text-xs text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            <button
              type="button"
              onClick={() => applyView(v)}
              className="pl-3 pr-2 py-1"
              title={`By ${v.createdBySlug}`}
            >
              {v.name}
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                className="pr-2 pl-1 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                aria-label={`Delete view ${v.name}`}
              >
                ×
              </button>
            )}
          </span>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        {showInput ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setShowInput(false);
                  setName("");
                  setError(null);
                }
              }}
              placeholder="View name..."
              autoFocus
              disabled={saving}
              className="px-2 py-1 text-xs bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)] min-w-[160px]"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-2 py-1 font-body font-semibold text-[13px] bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] hover:bg-[var(--color-elevated)] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setName("");
                setError(null);
              }}
              className="px-2 py-1 text-xs text-foreground-muted hover:text-off-white"
            >
              Cancel
            </button>
            {error && <span className="text-xs text-[var(--color-bad)]">{error}</span>}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="px-3 py-1 font-body font-semibold text-[13px] bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            + Save current view
          </button>
        )}
      </div>
    </div>
  );
}
