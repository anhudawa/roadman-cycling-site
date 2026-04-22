"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function SendTestDigestButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function send() {
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/admin/crm/digest/send-me", { method: "POST" });
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

  const label =
    status === "sending"
      ? "Sending…"
      : status === "sent"
      ? "Sent ✓"
      : status === "error"
      ? "Retry"
      : "Send test digest";

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`text-xs ${
            status === "error" ? "text-red-400" : "text-foreground-muted"
          }`}
        >
          {message}
        </span>
      )}
      <button
        type="button"
        onClick={send}
        disabled={status === "sending"}
        className="font-body font-semibold text-[13px] px-3 py-1.5 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition-colors disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}
