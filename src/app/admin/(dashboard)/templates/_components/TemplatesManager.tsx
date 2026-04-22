"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";

interface Template {
  id: number;
  name: string;
  slug: string;
  subject: string;
  body: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DraftState {
  id: number | null;
  name: string;
  slug: string;
  subject: string;
  body: string;
}

const EMPTY_DRAFT: DraftState = {
  id: null,
  name: "",
  slug: "",
  subject: "",
  body: "",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TemplatesManager({
  initial,
  focusSlug,
}: {
  initial: Template[];
  focusSlug?: string | null;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(initial);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement | null>>(new Map());

  useEffect(() => {
    if (!focusSlug) return;
    const match = initial.find((t) => t.slug === focusSlug);
    if (!match) return;
    setHighlightId(match.id);
    setDraft({
      id: match.id,
      name: match.name,
      slug: match.slug,
      subject: match.subject,
      body: match.body,
    });
    // Defer to next tick so the row exists in the DOM.
    requestAnimationFrame(() => {
      const row = rowRefs.current.get(match.id);
      if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [focusSlug, initial]);

  function openNew() {
    setDraft({ ...EMPTY_DRAFT });
    setError(null);
  }

  function openEdit(t: Template) {
    setDraft({
      id: t.id,
      name: t.name,
      slug: t.slug,
      subject: t.subject,
      body: t.body,
    });
    setError(null);
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim() || !draft.subject.trim() || !draft.body.trim()) {
      setError("Name, subject and body are required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: draft.name.trim(),
        slug: draft.slug.trim() || draft.name.trim(),
        subject: draft.subject.trim(),
        body: draft.body,
      };
      const res = draft.id
        ? await fetch(`/api/admin/crm/templates/${draft.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/crm/templates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      const saved = data.template as Template;
      setTemplates((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev];
      });
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this template?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setTemplates((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openNew}
          className="px-4 py-2 bg-[var(--color-coral)] text-white text-sm font-heading tracking-wider rounded-lg hover:bg-[var(--color-bad-tint)] transition-colors uppercase"
        >
          New Template
        </button>
      </div>

      {error && !draft && (
        <div className="mb-4 px-3 py-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground-subtle">
            No templates yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
                  Slug
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
                  Subject
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
                  Updated
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr
                  key={t.id}
                  ref={(el) => {
                    rowRefs.current.set(t.id, el);
                  }}
                  className={`border-b border-white/5 last:border-b-0 transition-colors ${
                    highlightId === t.id ? "bg-[var(--color-bad-tint)]" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-off-white">{t.name}</td>
                  <td className="px-4 py-3 text-foreground-muted font-mono text-xs">
                    {t.slug}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{t.subject}</td>
                  <td className="px-4 py-3 text-foreground-subtle text-xs">
                    {formatDate(t.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(t)}
                      className="px-2 py-1 text-xs border border-white/10 text-foreground-muted rounded hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)] mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      disabled={busy}
                      className="px-2 py-1 text-xs border border-white/10 text-foreground-muted rounded hover:border-red-400/30 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {draft && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-6 overflow-y-auto"
          onClick={() => !busy && setDraft(null)}
        >
          <div
            className="bg-background-elevated border border-white/10 rounded-xl max-w-2xl w-full p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-heading tracking-wider uppercase text-off-white text-lg">
                {draft.id ? "Edit Template" : "New Template"}
              </h2>
              <button
                onClick={() => setDraft(null)}
                className="text-foreground-subtle hover:text-off-white text-sm"
              >
                Close
              </button>
            </div>

            {error && (
              <div className="mb-3 px-3 py-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={draft.slug}
                  placeholder="auto-generated from name if blank"
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)] font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-1">
                  Body
                </label>
                <textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  rows={14}
                  className="w-full px-3 py-2 text-sm bg-background-deep border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)] font-mono resize-vertical"
                />
                <p className="text-[11px] text-foreground-subtle mt-1">
                  Placeholders: {"{{first_name}}"}, {"{{name}}"}, {"{{email}}"}, {"{{agent_name}}"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDraft(null)}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase border border-white/10 text-foreground-muted rounded hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase bg-[var(--color-bad-tint)] text-[var(--color-bad)] border border-[var(--color-border-strong)] rounded hover:bg-[var(--color-bad-tint)] disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
