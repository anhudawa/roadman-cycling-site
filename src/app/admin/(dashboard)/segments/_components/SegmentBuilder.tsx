"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type CustomFieldFilterOp = "eq" | "ne" | "contains" | "present" | "absent";

export interface CustomFieldFilterDraft {
  key: string;
  op: CustomFieldFilterOp;
  value?: string;
}

export interface SegmentFiltersDraft {
  tagsAny?: string[];
  lifecycleStageIn?: string[];
  ownerIn?: string[];
  sourceIn?: string[];
  isSubscriber?: boolean;
  isCustomer?: boolean;
  lastActivityBefore?: string;
  lastActivityAfter?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  customFields?: CustomFieldFilterDraft[];
}

interface FieldDefLite {
  id: number;
  key: string;
  label: string;
  type: string;
}

export interface SegmentDraft {
  id?: number;
  name: string;
  description: string;
  filters: SegmentFiltersDraft;
}

interface PreviewRow {
  id: number;
  email: string;
  name: string | null;
  lifecycleStage: string;
  tags: string[] | null;
}

const LIFECYCLE_STAGES = ["lead", "prospect", "customer", "evangelist", "archived"];
const TEAM_SLUGS = ["ted", "sarah", "wes", "matthew"];
const SOURCES = ["contact_form", "cohort_application", "manual", "import", "subscribers"];

const EMPTY_DRAFT: SegmentDraft = {
  name: "",
  description: "",
  filters: {},
};

function csvInput(value: string[] | undefined): string {
  return (value ?? []).join(", ");
}
function parseCsv(s: string): string[] | undefined {
  const arr = s.split(",").map((x) => x.trim()).filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

function TriState({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">{label}</label>
      <select
        value={value === undefined ? "" : value ? "true" : "false"}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : v === "true");
        }}
        className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
      >
        <option value="">Any</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>
  );
}

function MultiCheck({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[] | undefined;
  onChange: (v: string[] | undefined) => void;
}) {
  const set = new Set(value ?? []);
  function toggle(opt: string) {
    const next = new Set(set);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    const arr = Array.from(next);
    onChange(arr.length > 0 ? arr : undefined);
  }
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">{label}</label>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = set.has(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={`px-2 py-1 text-[11px] border rounded transition-colors ${
                active
                  ? "bg-[var(--color-bad-tint)] border-[var(--color-border-strong)] text-[var(--color-bad)]"
                  : "bg-white/[0.03] border-white/10 text-foreground-muted hover:text-off-white"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SegmentBuilder({
  initial,
  mode,
}: {
  initial?: SegmentDraft;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<SegmentDraft>(initial ?? EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ count: number; preview: PreviewRow[] } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fieldDefs, setFieldDefs] = useState<FieldDefLite[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/crm/custom-fields")
      .then((r) => (r.ok ? r.json() : { defs: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.defs)) setFieldDefs(data.defs);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const runPreview = useCallback(async (filters: SegmentFiltersDraft) => {
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/crm/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreview({ count: data.count, preview: data.preview });
      }
    } catch {
      /* ignore */
    } finally {
      setPreviewing(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runPreview(draft.filters);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft.filters, runPreview]);

  function patchFilters(patch: Partial<SegmentFiltersDraft>) {
    setDraft((d) => {
      const next = { ...d.filters, ...patch };
      // Strip undefined keys
      (Object.keys(next) as Array<keyof SegmentFiltersDraft>).forEach((k) => {
        if (next[k] === undefined) delete next[k];
      });
      return { ...d, filters: next };
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const body = {
        name: draft.name,
        description: draft.description || null,
        filters: draft.filters,
      };
      const url = mode === "create" ? "/api/admin/crm/segments" : `/api/admin/crm/segments/${draft.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (mode === "create") {
        router.push(`/admin/segments/${data.segment.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const f = draft.filters;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="bg-background-elevated border border-white/5 rounded-lg p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Stale customers $€” no activity 90d"
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={2}
              placeholder="Optional notes about this segment"
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>
        </div>

        <div className="bg-background-elevated border border-white/5 rounded-lg p-5 space-y-4">
          <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Filters</h3>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Search (email or name)</label>
            <input
              type="text"
              value={f.search ?? ""}
              onChange={(e) => patchFilters({ search: e.target.value || undefined })}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Tags $€” any of (comma separated)</label>
            <input
              type="text"
              value={csvInput(f.tagsAny)}
              onChange={(e) => patchFilters({ tagsAny: parseCsv(e.target.value) })}
              placeholder="vip, cohort-2026"
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>

          <MultiCheck
            label="Lifecycle stage"
            options={LIFECYCLE_STAGES}
            value={f.lifecycleStageIn}
            onChange={(v) => patchFilters({ lifecycleStageIn: v })}
          />

          <MultiCheck
            label="Owner"
            options={TEAM_SLUGS}
            value={f.ownerIn}
            onChange={(v) => patchFilters({ ownerIn: v })}
          />

          <MultiCheck
            label="Source"
            options={SOURCES}
            value={f.sourceIn}
            onChange={(v) => patchFilters({ sourceIn: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <TriState
              label="Beehiiv subscriber"
              value={f.isSubscriber}
              onChange={(v) => patchFilters({ isSubscriber: v })}
            />
            <TriState
              label="Stripe customer"
              value={f.isCustomer}
              onChange={(v) => patchFilters({ isCustomer: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Last activity after</label>
              <input
                type="date"
                value={(f.lastActivityAfter ?? "").slice(0, 10)}
                onChange={(e) => patchFilters({ lastActivityAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Last activity before</label>
              <input
                type="date"
                value={(f.lastActivityBefore ?? "").slice(0, 10)}
                onChange={(e) => patchFilters({ lastActivityBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Created after</label>
              <input
                type="date"
                value={(f.createdAfter ?? "").slice(0, 10)}
                onChange={(e) => patchFilters({ createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Created before</label>
              <input
                type="date"
                value={(f.createdBefore ?? "").slice(0, 10)}
                onChange={(e) => patchFilters({ createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-background-elevated border border-white/5 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Custom field filters</h3>
            <button
              type="button"
              disabled={fieldDefs.length === 0}
              onClick={() => {
                const first = fieldDefs[0];
                if (!first) return;
                const next: CustomFieldFilterDraft[] = [
                  ...(f.customFields ?? []),
                  { key: first.key, op: "eq", value: "" },
                ];
                patchFilters({ customFields: next });
              }}
              className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-foreground-muted hover:text-off-white disabled:opacity-40"
            >
              + Add filter
            </button>
          </div>
          {fieldDefs.length === 0 && (
            <p className="text-xs text-foreground-subtle">No custom fields defined.</p>
          )}
          {(f.customFields ?? []).map((cf, i) => {
            const needsValue = cf.op !== "present" && cf.op !== "absent";
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select
                  value={cf.key}
                  onChange={(e) => {
                    const next = [...(f.customFields ?? [])];
                    next[i] = { ...next[i], key: e.target.value };
                    patchFilters({ customFields: next });
                  }}
                  className="px-2 py-1.5 bg-background-deep border border-white/10 rounded text-xs text-off-white"
                >
                  {fieldDefs.map((d) => (
                    <option key={d.id} value={d.key}>
                      {d.label} ({d.key})
                    </option>
                  ))}
                </select>
                <select
                  value={cf.op}
                  onChange={(e) => {
                    const next = [...(f.customFields ?? [])];
                    next[i] = { ...next[i], op: e.target.value as CustomFieldFilterOp };
                    patchFilters({ customFields: next });
                  }}
                  className="px-2 py-1.5 bg-background-deep border border-white/10 rounded text-xs text-off-white"
                >
                  <option value="eq">equals</option>
                  <option value="ne">not equals</option>
                  <option value="contains">contains</option>
                  <option value="present">is set</option>
                  <option value="absent">is not set</option>
                </select>
                {needsValue && (
                  <input
                    type="text"
                    value={cf.value ?? ""}
                    onChange={(e) => {
                      const next = [...(f.customFields ?? [])];
                      next[i] = { ...next[i], value: e.target.value };
                      patchFilters({ customFields: next });
                    }}
                    placeholder="value"
                    className="flex-1 min-w-[160px] px-2 py-1.5 bg-background-deep border border-white/10 rounded text-xs text-off-white"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    const next = (f.customFields ?? []).filter((_, j) => j !== i);
                    patchFilters({ customFields: next.length ? next : undefined });
                  }}
                  className="px-2 py-1 text-[11px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-300"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={save}
            disabled={busy || !draft.name.trim()}
            className="px-4 py-2 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] font-medium rounded text-sm disabled:opacity-50"
          >
            {busy ? "Saving..." : mode === "create" ? "Create segment" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="bg-background-elevated border border-white/5 rounded-lg p-5 h-fit sticky top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Preview</h3>
          {previewing && <span className="text-[10px] text-foreground-subtle">updating...</span>}
        </div>
        <div className="text-3xl font-heading text-[var(--color-bad)]">{preview?.count ?? "$€”"}</div>
        <div className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-3">matching contacts</div>
        {preview && preview.preview.length > 0 ? (
          <ul className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {preview.preview.map((c) => (
              <li key={c.id} className="text-xs border-b border-white/5 pb-1.5">
                <div className="text-off-white truncate">{c.name ?? c.email}</div>
                <div className="text-foreground-subtle truncate">{c.email}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-foreground-subtle">No contacts match these filters.</p>
        )}
      </div>
    </div>
  );
}
