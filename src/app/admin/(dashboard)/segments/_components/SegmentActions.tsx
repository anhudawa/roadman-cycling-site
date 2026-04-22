"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: number;
  slug: string;
  name: string;
  subject: string;
}

export function SegmentActions({
  segmentId,
  memberCount,
  canSendEmail,
  templates,
}: {
  segmentId: number;
  memberCount: number;
  canSendEmail: boolean;
  templates: Template[];
}) {
  const router = useRouter();
  const [showSend, setShowSend] = useState(false);
  const [templateSlug, setTemplateSlug] = useState(templates[0]?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; errors: Array<{ email: string; error: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    if (!confirm("Delete this segment? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/segments/${segmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/admin/segments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  async function send() {
    if (!templateSlug) {
      setError("Pick a template");
      return;
    }
    if (memberCount > 500) {
      setError(`Segment has ${memberCount} members. Hard cap is 500.`);
      return;
    }
    if (!confirm(`Send template "${templateSlug}" to ${memberCount} contacts?`)) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/crm/segments/${segmentId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult({ sent: data.sent, failed: data.failed, errors: data.errors ?? [] });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a
          href={`/admin/segments/${segmentId}/edit`}
          className="px-3 py-2 border border-white/10 text-sm text-off-white rounded hover:bg-white/5"
        >
          Edit
        </a>
        {canSendEmail && (
          <button
            type="button"
            onClick={() => setShowSend((v) => !v)}
            disabled={busy || memberCount === 0}
            className="px-3 py-2 bg-[var(--color-coral)] text-background-deep font-medium rounded text-sm hover:bg-[var(--color-coral-hover)] disabled:opacity-50"
          >
            {showSend ? "Cancel send" : "Send email"}
          </button>
        )}
        <button
          type="button"
          onClick={del}
          disabled={busy}
          className="px-3 py-2 border border-red-500/30 text-red-300 rounded text-sm hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>

      {showSend && canSendEmail && (
        <div className="bg-background-elevated border border-white/5 rounded-lg p-4 space-y-3">
          <h3 className="font-heading text-sm text-off-white tracking-wider uppercase">Send email to {memberCount} contacts</h3>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">Template</label>
            <select
              value={templateSlug}
              onChange={(e) => setTemplateSlug(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background-deep border border-white/10 rounded text-sm text-off-white"
            >
              {templates.length === 0 && <option value="">(no templates)</option>}
              {templates.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name} ({t.slug})</option>
              ))}
            </select>
          </div>
          {memberCount > 500 && (
            <p className="text-xs text-red-300">Segment exceeds hard cap of 500. Narrow the filters.</p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={busy || memberCount === 0 || memberCount > 500 || !templateSlug}
            className="px-3 py-2 bg-[var(--color-coral)] text-background-deep font-medium rounded text-sm hover:bg-[var(--color-coral-hover)] disabled:opacity-50"
          >
            {busy ? "Sending..." : `Confirm — send to ${memberCount}`}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-300">
          Sent {result.sent} — failed {result.failed}.
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-foreground-muted space-y-0.5 max-h-40 overflow-y-auto">
              {result.errors.map((e, i) => (
                <li key={i}>{e.email}: {e.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
