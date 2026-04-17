"use client";

import { useState } from "react";

type FieldType = "text" | "longtext" | "number" | "date" | "url" | "select" | "boolean";

interface Option {
  label: string;
  value: string;
}

interface FieldDef {
  id: number;
  key: string;
  label: string;
  type: FieldType;
  options: Option[];
  helpText: string | null;
  sortOrder: number;
}

const FIELD_TYPES: FieldType[] = [
  "text",
  "longtext",
  "number",
  "date",
  "url",
  "select",
  "boolean",
];

function parseOptionsText(text: string): Option[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return { label: line, value: line };
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return { label: label || value, value };
    })
    .filter((o) => o.value);
}

function optionsToText(options: Option[]): string {
  return options.map((o) => `${o.label}=${o.value}`).join("\n");
}

export function CustomFieldsPanel({ initial }: { initial: FieldDef[] }) {
  const [defs, setDefs] = useState<FieldDef[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newDraft, setNewDraft] = useState({
    key: "",
    label: "",
    type: "text" as FieldType,
    helpText: "",
    sortOrder: "0",
    optionsText: "",
  });

  const [editDraft, setEditDraft] = useState<{
    label: string;
    helpText: string;
    sortOrder: string;
    optionsText: string;
  }>({ label: "", helpText: "", sortOrder: "0", optionsText: "" });

  async function createField() {
    setBusyId("new");
    setError(null);
    try {
      const res = await fetch("/api/admin/crm/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newDraft.key,
          label: newDraft.label,
          type: newDraft.type,
          helpText: newDraft.helpText || null,
          sortOrder: parseInt(newDraft.sortOrder, 10) || 0,
          options:
            newDraft.type === "select" ? parseOptionsText(newDraft.optionsText) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setDefs((prev) => [...prev, data.def].sort(sortFn));
      setShowNew(false);
      setNewDraft({
        key: "",
        label: "",
        type: "text",
        helpText: "",
        sortOrder: "0",
        optionsText: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const def = defs.find((d) => d.id === id);
      const res = await fetch(`/api/admin/crm/custom-fields/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editDraft.label,
          helpText: editDraft.helpText || null,
          sortOrder: parseInt(editDraft.sortOrder, 10) || 0,
          options:
            def?.type === "select" ? parseOptionsText(editDraft.optionsText) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setDefs((prev) => prev.map((d) => (d.id === id ? data.def : d)).sort(sortFn));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(def: FieldDef) {
    if (!confirm(`Delete custom field "${def.label}" (${def.key})? This will also strip the value from every contact.`)) return;
    setBusyId(def.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/custom-fields/${def.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setDefs((prev) => prev.filter((d) => d.id !== def.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(def: FieldDef) {
    setEditingId(def.id);
    setEditDraft({
      label: def.label,
      helpText: def.helpText ?? "",
      sortOrder: String(def.sortOrder),
      optionsText: optionsToText(def.options),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-sm uppercase tracking-widest text-off-white">
            Custom Fields
          </h2>
          <p className="text-xs text-foreground-subtle mt-1">
            Fields that appear on every contact&apos;s detail page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="px-3 py-1.5 text-xs bg-coral text-background-deep font-medium rounded hover:bg-coral/90"
        >
          {showNew ? "Cancel" : "+ Add field"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {showNew && (
        <div className="bg-background-elevated border border-white/10 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Key</label>
              <input
                type="text"
                value={newDraft.key}
                onChange={(e) => setNewDraft((d) => ({ ...d, key: e.target.value }))}
                placeholder="e.g. ftp_watts"
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Label</label>
              <input
                type="text"
                value={newDraft.label}
                onChange={(e) => setNewDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="e.g. FTP (watts)"
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Type</label>
              <select
                value={newDraft.type}
                onChange={(e) => setNewDraft((d) => ({ ...d, type: e.target.value as FieldType }))}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Help text</label>
              <input
                type="text"
                value={newDraft.helpText}
                onChange={(e) => setNewDraft((d) => ({ ...d, helpText: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Sort order</label>
              <input
                type="number"
                value={newDraft.sortOrder}
                onChange={(e) => setNewDraft((d) => ({ ...d, sortOrder: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
          </div>
          {newDraft.type === "select" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
                Options (one per line, <code>label=value</code>)
              </label>
              <textarea
                rows={4}
                value={newDraft.optionsText}
                onChange={(e) => setNewDraft((d) => ({ ...d, optionsText: e.target.value }))}
                placeholder={"Beginner=beginner\nIntermediate=intermediate\nAdvanced=advanced"}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white font-mono"
              />
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={createField}
              disabled={busyId === "new" || !newDraft.key || !newDraft.label}
              className="px-3 py-2 bg-coral text-background-deep font-medium rounded text-sm hover:bg-coral/90 disabled:opacity-50"
            >
              {busyId === "new" ? "Creating..." : "Create field"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Help text</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground-subtle text-xs">
                  No custom fields defined yet.
                </td>
              </tr>
            )}
            {defs.map((d) => {
              const isEditing = editingId === d.id;
              return (
                <tr key={d.id} className="border-b border-white/5 align-top">
                  {isEditing ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editDraft.label}
                          onChange={(e) => setEditDraft((x) => ({ ...x, label: e.target.value }))}
                          className="w-full px-2 py-1 bg-background-deep border border-white/10 rounded text-sm text-off-white"
                        />
                      </td>
                      <td className="px-4 py-3 text-foreground-muted text-xs font-mono">{d.key}</td>
                      <td className="px-4 py-3 text-foreground-muted text-xs">{d.type}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editDraft.helpText}
                          onChange={(e) => setEditDraft((x) => ({ ...x, helpText: e.target.value }))}
                          className="w-full px-2 py-1 bg-background-deep border border-white/10 rounded text-sm text-off-white"
                        />
                        {d.type === "select" && (
                          <textarea
                            rows={3}
                            value={editDraft.optionsText}
                            onChange={(e) => setEditDraft((x) => ({ ...x, optionsText: e.target.value }))}
                            placeholder="label=value per line"
                            className="mt-2 w-full px-2 py-1 bg-background-deep border border-white/10 rounded text-xs text-off-white font-mono"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editDraft.sortOrder}
                          onChange={(e) => setEditDraft((x) => ({ ...x, sortOrder: e.target.value }))}
                          className="w-16 px-2 py-1 bg-background-deep border border-white/10 rounded text-sm text-off-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(d.id)}
                            disabled={busyId === d.id}
                            className="px-2 py-1 text-[11px] bg-coral text-background-deep font-medium rounded hover:bg-coral/90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-[11px] bg-white/5 border border-white/10 rounded text-foreground-muted hover:text-off-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-off-white font-medium">{d.label}</td>
                      <td className="px-4 py-3 text-foreground-muted text-xs font-mono">{d.key}</td>
                      <td className="px-4 py-3 text-foreground-muted text-xs">
                        {d.type}
                        {d.type === "select" && d.options.length > 0 && (
                          <span className="ml-1 text-foreground-subtle">({d.options.length})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted text-xs">{d.helpText ?? ""}</td>
                      <td className="px-4 py-3 text-foreground-muted text-xs">{d.sortOrder}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(d)}
                            className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-foreground-muted hover:text-off-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(d)}
                            disabled={busyId === d.id}
                            className="px-2 py-1 text-[11px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-300 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function sortFn(a: FieldDef, b: FieldDef) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.label.localeCompare(b.label);
}
