"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

function TestButton({
  label,
  endpoint,
}: {
  label: string;
  endpoint: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function send() {
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        to?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? `Failed (${res.status})`);
        return;
      }
      setStatus("sent");
      setMessage(data.to ? `Sent to ${data.to}` : "Sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Network error");
    }
  }

  const btnLabel =
    status === "sending"
      ? "Sending…"
      : status === "sent"
      ? "Sent ✓"
      : status === "error"
      ? "Retry"
      : label;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={send}
        disabled={status === "sending"}
        className="text-xs uppercase tracking-wider px-3 py-1.5 rounded border border-white/10 text-foreground-muted hover:text-coral hover:border-coral/40 transition-colors disabled:opacity-50"
      >
        {btnLabel}
      </button>
      {message && (
        <span
          className={`text-xs ${
            status === "error" ? "text-red-400" : "text-foreground-muted"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}

export function DigestTestButtons() {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
        Digest tests
      </h3>
      <div className="bg-background-elevated border border-white/5 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-off-white">Daily digest</div>
            <div className="text-xs text-foreground-subtle">
              Your My-Day rollup — overdue tasks, apps waiting, stale contacts.
            </div>
          </div>
          <TestButton label="Send daily test" endpoint="/api/admin/crm/digest/send-me" />
        </div>
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div>
            <div className="text-sm text-off-white">Weekly rollup</div>
            <div className="text-xs text-foreground-subtle">
              Last 7 days — new contacts, apps, deals, email engagement.
            </div>
          </div>
          <TestButton
            label="Send weekly test"
            endpoint="/api/admin/crm/weekly-digest/send-me"
          />
        </div>
      </div>
    </div>
  );
}
