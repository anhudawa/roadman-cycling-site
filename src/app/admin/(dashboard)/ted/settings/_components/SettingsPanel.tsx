"use client";

import { useState } from "react";

interface State {
  paused: boolean;
  reason: string;
  postPromptEnabled: boolean;
  postWelcomeEnabled: boolean;
  surfaceThreadsEnabled: boolean;
}

export function SettingsPanel({ initial }: { initial: State }) {
  const [state, setState] = useState<State>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(patch: Partial<State>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ted/kill-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage(`Save failed: ${err.error ?? res.statusText}`);
        return;
      }
      const data = (await res.json()) as { state: Record<string, unknown> };
      setState({
        paused: Boolean(data.state.paused),
        reason: String(data.state.reason ?? ""),
        postPromptEnabled: Boolean(data.state.postPromptEnabled),
        postWelcomeEnabled: Boolean(data.state.postWelcomeEnabled),
        surfaceThreadsEnabled: Boolean(data.state.surfaceThreadsEnabled),
      });
      setMessage("Saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Kill switch */}
      <section className="rounded-md bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Kill switch</div>
            <div className="text-xs text-foreground-subtle">
              Pause stops every scheduled Ted job within one item.
            </div>
          </div>
          <button
            disabled={saving}
            className={`text-sm px-3 py-1.5 rounded-md ${
              state.paused
                ? "bg-[var(--color-bad-tint)] text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)]"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            }`}
            onClick={() => save({ paused: !state.paused, reason: state.reason })}
          >
            {state.paused ? "Paused $— click to resume" : "Running $— click to pause"}
          </button>
        </div>
        <div>
          <label className="text-xs text-foreground-subtle">Reason (optional)</label>
          <input
            type="text"
            value={state.reason}
            onChange={(e) => setState((p) => ({ ...p, reason: e.target.value }))}
            onBlur={() => state.paused && save({ paused: true, reason: state.reason })}
            className="mt-1 w-full rounded-md bg-charcoal border border-white/10 p-2 text-sm text-white"
            placeholder="Why is Ted paused?"
          />
        </div>
      </section>

      {/* Posting gates */}
      <section className="rounded-md bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="text-sm font-semibold text-white">Posting gates</div>
        <div className="text-xs text-foreground-subtle">
          Shadow mode = gate off; Ted still drafts but never hits Skool.
        </div>

        <Gate
          label="Daily prompts"
          enabled={state.postPromptEnabled}
          onChange={(v) => save({ postPromptEnabled: v })}
        />
        <Gate
          label="New-member welcomes"
          enabled={state.postWelcomeEnabled}
          onChange={(v) => save({ postWelcomeEnabled: v })}
        />
        <Gate
          label="Thread surfacing"
          enabled={state.surfaceThreadsEnabled}
          onChange={(v) => save({ surfaceThreadsEnabled: v })}
        />
      </section>

      {message ? (
        <div className="text-xs text-foreground-subtle">{message}</div>
      ) : null}
    </div>
  );
}

function Gate({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-white/5 first:border-0">
      <div className="text-sm text-white">{label}</div>
      <button
        onClick={() => onChange(!enabled)}
        className={`text-xs px-3 py-1 rounded-full ${
          enabled
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-white/10 text-foreground-subtle"
        }`}
      >
        {enabled ? "enabled" : "shadow"}
      </button>
    </div>
  );
}
