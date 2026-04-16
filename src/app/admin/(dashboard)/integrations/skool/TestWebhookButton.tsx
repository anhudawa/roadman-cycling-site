"use client";

import { useState } from "react";

/**
 * Fire a sample payload at /api/skool-webhook so the admin can verify the
 * pipeline end-to-end without touching Zapier / Skool. The button only
 * sends the body — the server uses process.env.SKOOL_WEBHOOK_SECRET the
 * same as a real Skool call would, so it's a faithful smoke test.
 *
 * NOTE: the test POST does not include ?secret=…, so if SKOOL_WEBHOOK_SECRET
 * is configured, the event shows up in the audit log as "unauthorized" —
 * that's deliberate, it proves the secret is being enforced. Clicking with
 * "Send authenticated" uses the admin's login cookie to call a small proxy
 * route that attaches the secret server-side.
 */
export function TestWebhookButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function sendTest(authenticated: boolean) {
    setStatus("sending");
    setMessage(null);
    try {
      const url = authenticated
        ? "/api/admin/skool-test"
        : "/api/skool-webhook";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "member.joined",
          data: {
            email: `admin-test-${Date.now()}@roadmancycling.com`,
            name: "Admin Smoke Test",
            questions: [
              "I keep plateauing on my FTP",
              "Train 8 hours a week",
            ],
          },
          source: "curl",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("ok");
        setMessage(
          `Delivered ${res.status}: ${body.ok ? "accepted" : body.reason ?? "skipped"}${
            body.persona ? ` · persona=${body.persona}` : ""
          }`
        );
      } else {
        setStatus("err");
        setMessage(`HTTP ${res.status}: ${body.error ?? "unknown"}`);
      }
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={() => sendTest(true)}
        disabled={status === "sending"}
        className="text-xs px-3 py-1.5 rounded-lg bg-coral/15 text-coral border border-coral/30 hover:bg-coral/25 disabled:opacity-50 font-heading tracking-wider uppercase"
      >
        {status === "sending" ? "Sending…" : "Send test webhook"}
      </button>
      <button
        type="button"
        onClick={() => sendTest(false)}
        disabled={status === "sending"}
        className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-foreground-muted hover:text-off-white hover:border-white/30 disabled:opacity-50"
      >
        Send unauthenticated (proves secret is enforced)
      </button>
      {message && (
        <span
          className={`text-xs ${
            status === "ok"
              ? "text-green-400"
              : status === "err"
                ? "text-coral"
                : "text-foreground-subtle"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
