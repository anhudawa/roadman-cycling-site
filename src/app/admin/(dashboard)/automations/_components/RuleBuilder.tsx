"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TriggerType =
  | "application.stage_changed"
  | "deal.stage_changed"
  | "contact.created"
  | "contact.lifecycle_changed";

type ActionType = "send_email" | "create_task" | "add_tag" | "notify_user";

interface ActionDraft {
  type: ActionType;
  config: Record<string, string | number | undefined>;
}

export interface RuleDraft {
  id?: number;
  name: string;
  active: boolean;
  triggerType: TriggerType;
  triggerConfig: { toStage?: string; source?: string };
  actions: ActionDraft[];
  maxRunsPerDay: number;
  dedupeWindowMinutes: number;
}

const TRIGGER_LABELS: Record<TriggerType, string> = {
  "application.stage_changed": "Application stage changed",
  "deal.stage_changed": "Deal stage changed",
  "contact.created": "Contact created",
  "contact.lifecycle_changed": "Contact lifecycle changed",
};

const APPLICATION_STAGES = ["awaiting_response", "contacted", "qualified", "accepted", "rejected"];
const DEAL_STAGES = ["qualified", "proposal", "negotiation", "won", "lost"];
const LIFECYCLE_STAGES = ["lead", "prospect", "customer", "evangelist", "archived"];
const TEAM_SLUGS = ["ted", "sarah", "wes", "matthew"];

function stageOptionsFor(trigger: TriggerType): string[] {
  if (trigger === "application.stage_changed") return APPLICATION_STAGES;
  if (trigger === "deal.stage_changed") return DEAL_STAGES;
  if (trigger === "contact.lifecycle_changed") return LIFECYCLE_STAGES;
  return [];
}

const EMPTY_DRAFT: RuleDraft = {
  name: "",
  active: true,
  triggerType: "application.stage_changed",
  triggerConfig: {},
  actions: [],
  maxRunsPerDay: 0,
  dedupeWindowMinutes: 0,
};

export function RuleBuilder({
  initial,
  mode,
}: {
  initial?: RuleDraft;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<RuleDraft>(initial ?? EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateAction(i: number, patch: Partial<ActionDraft>) {
    setDraft((d) => ({
      ...d,
      actions: d.actions.map((a, idx) => (idx === i ? { ...a, ...patch, config: { ...a.config, ...(patch.config ?? {}) } } : a)),
    }));
  }

  function removeAction(i: number) {
    setDraft((d) => ({ ...d, actions: d.actions.filter((_, idx) => idx !== i) }));
  }

  function addAction(type: ActionType) {
    const defaults: Record<ActionType, Record<string, string | number | undefined>> = {
      send_email: { templateSlug: "" },
      create_task: { title: "", dueInDays: 1 },
      add_tag: { tag: "" },
      notify_user: { recipientSlug: "ted", title: "" },
    };
    setDraft((d) => ({
      ...d,
      actions: [...d.actions, { type, config: defaults[type] }],
    }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const actionsPayload = draft.actions.map((a) => {
        const cfg = { ...a.config };
        if (a.type === "create_task" && cfg.dueInDays !== undefined && cfg.dueInDays !== "") {
          cfg.dueInDays = Number(cfg.dueInDays);
        }
        return { type: a.type, config: cfg };
      });
      const body = {
        name: draft.name,
        active: draft.active,
        triggerType: draft.triggerType,
        triggerConfig: draft.triggerConfig,
        actions: actionsPayload,
        maxRunsPerDay: Number(draft.maxRunsPerDay) || 0,
        dedupeWindowMinutes: Number(draft.dedupeWindowMinutes) || 0,
      };
      const url = mode === "create" ? "/api/admin/crm/automations" : `/api/admin/crm/automations/${draft.id}`;
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
        router.push(`/admin/automations/${data.rule.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!draft.id) return;
    if (!confirm("Delete this rule?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/automations/${draft.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/admin/automations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  const stageOpts = stageOptionsFor(draft.triggerType);

  return (
    <div className="space-y-6">
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
            onChange={(e) => setField("name", e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            placeholder="e.g. Onboard accepted applicants"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setField("active", e.target.checked)}
            className="accent-coral"
          />
          <label htmlFor="active" className="text-sm text-foreground-muted">Active</label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
              Max runs per day (0 = unlimited)
            </label>
            <input
              type="number"
              min={0}
              value={String(draft.maxRunsPerDay)}
              onChange={(e) => setField("maxRunsPerDay", e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
              Dedupe window in minutes (0 = off)
            </label>
            <input
              type="number"
              min={0}
              value={String(draft.dedupeWindowMinutes)}
              onChange={(e) => setField("dedupeWindowMinutes", e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-background-elevated border border-white/5 rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Trigger</h3>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Event</label>
          <select
            value={draft.triggerType}
            onChange={(e) => {
              setField("triggerType", e.target.value as TriggerType);
              setField("triggerConfig", {});
            }}
            className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
          >
            {(Object.keys(TRIGGER_LABELS) as TriggerType[]).map((t) => (
              <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {stageOpts.length > 0 && (
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">To stage (optional — blank = any)</label>
            <select
              value={draft.triggerConfig.toStage ?? ""}
              onChange={(e) => setField("triggerConfig", { ...draft.triggerConfig, toStage: e.target.value || undefined })}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            >
              <option value="">Any stage</option>
              {stageOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {draft.triggerType === "contact.created" && (
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Source (optional)</label>
            <input
              type="text"
              value={draft.triggerConfig.source ?? ""}
              onChange={(e) => setField("triggerConfig", { ...draft.triggerConfig, source: e.target.value || undefined })}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
              placeholder="e.g. cohort_application"
            />
          </div>
        )}
      </div>

      <div className="bg-background-elevated border border-white/5 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Actions</h3>
          <div className="flex gap-1 flex-wrap">
            {(["send_email", "create_task", "add_tag", "notify_user"] as ActionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addAction(t)}
                className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-foreground-muted hover:text-off-white"
              >
                + {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {draft.actions.length === 0 && (
          <p className="text-xs text-foreground-subtle">No actions yet. Add one above.</p>
        )}

        <div className="space-y-3">
          {draft.actions.map((a, i) => (
            <div key={i} className="bg-background-deep border border-white/10 rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-accent font-medium">{a.type}</span>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="text-[11px] text-foreground-subtle hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              {a.type === "send_email" && (
                <input
                  type="text"
                  value={String(a.config.templateSlug ?? "")}
                  onChange={(e) => updateAction(i, { config: { templateSlug: e.target.value } })}
                  placeholder="template slug (e.g. cohort-welcome)"
                  className="w-full px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                />
              )}

              {a.type === "create_task" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={String(a.config.title ?? "")}
                    onChange={(e) => updateAction(i, { config: { title: e.target.value } })}
                    placeholder="Task title (supports {{first_name}})"
                    className="w-full px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={String(a.config.assignedTo ?? "")}
                      onChange={(e) => updateAction(i, { config: { assignedTo: e.target.value || undefined } })}
                      className="px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                    >
                      <option value="">(rule creator)</option>
                      {TEAM_SLUGS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      type="number"
                      value={String(a.config.dueInDays ?? "")}
                      onChange={(e) => updateAction(i, { config: { dueInDays: e.target.value === "" ? undefined : Number(e.target.value) } })}
                      placeholder="due in days"
                      className="px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                    />
                  </div>
                </div>
              )}

              {a.type === "add_tag" && (
                <input
                  type="text"
                  value={String(a.config.tag ?? "")}
                  onChange={(e) => updateAction(i, { config: { tag: e.target.value } })}
                  placeholder="tag name"
                  className="w-full px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                />
              )}

              {a.type === "notify_user" && (
                <div className="space-y-2">
                  <select
                    value={String(a.config.recipientSlug ?? "ted")}
                    onChange={(e) => updateAction(i, { config: { recipientSlug: e.target.value } })}
                    className="w-full px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                  >
                    {TEAM_SLUGS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="text"
                    value={String(a.config.title ?? "")}
                    onChange={(e) => updateAction(i, { config: { title: e.target.value } })}
                    placeholder="Notification title"
                    className="w-full px-2 py-1.5 bg-background-elevated border border-white/10 rounded text-sm text-off-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={save}
          disabled={busy || !draft.name.trim()}
          className="px-4 py-2 bg-[var(--color-coral)] text-background-deep font-medium rounded text-sm hover:bg-[var(--color-coral-hover)] disabled:opacity-50"
        >
          {busy ? "Saving..." : mode === "create" ? "Create rule" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={del}
            disabled={busy}
            className="px-3 py-2 border border-red-500/30 text-red-300 rounded text-sm hover:bg-red-500/10"
          >
            Delete rule
          </button>
        )}
      </div>
    </div>
  );
}
