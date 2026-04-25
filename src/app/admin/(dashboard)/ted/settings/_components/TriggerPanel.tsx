"use client";

import { useEffect, useState } from "react";

interface Availability {
  available: boolean;
  reason: string | null;
  workflows: string[];
}

const WORKFLOWS: Array<{ id: string; label: string; description: string }> = [
  {
    id: "draft-prompt",
    label: "Draft prompt now",
    description: "Generates tomorrow's prompt (or the date you set) into the review queue.",
  },
  {
    id: "post-prompt",
    label: "Post prompt now",
    description: "Posts the next approved draft. Respects the kill switch.",
  },
  {
    id: "welcomes",
    label: "Run welcomes now",
    description: "Drafts + posts pending welcomes.",
  },
  {
    id: "surface-threads",
    label: "Run surfacing now",
    description: "Scans recent threads and surfaces up to 2.",
  },
];

export function TriggerPanel() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ted/trigger")
      .then((r) => r.json())
      .then((d) => setAvailability(d as Availability))
      .catch(() => setAvailability({ available: false, reason: "unreachable", workflows: [] }));
  }, []);

  async function trigger(workflow: string) {
    setBusy(workflow);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ted/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Failed: ${data.error ?? res.statusText}`);
        return;
      }
      setMessage(
        `Dispatched ${workflow} on ${data.ref}. Check the Actions tab for run status.`
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-md bg-white/5 border border-white/10 p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-white">Run a job now</div>
        <div className="text-xs text-foreground-subtle">
          Fires the matching GitHub Actions workflow via workflow_dispatch.
          Useful for testing after a deploy or catching up after a quiet day.
        </div>
      </div>

      {availability === null ? (
        <div className="text-xs text-foreground-subtle">Checking availability$€¦</div>
      ) : !availability.available ? (
        <div className="text-xs text-yellow-300">
          Manual triggers unavailable: {availability.reason}.
          {" "}Set <code className="px-1 rounded bg-white/5">GITHUB_TOKEN</code> (with
          <code className="mx-1 px-1 rounded bg-white/5">actions:write</code>) and
          <code className="mx-1 px-1 rounded bg-white/5">GITHUB_REPO</code> (e.g.
          <code className="mx-1 px-1 rounded bg-white/5">anhudawa/roadman-cycling-site</code>)
          in Vercel env to enable.
        </div>
      ) : (
        <div className="space-y-2">
          {WORKFLOWS.map((w) => (
            <div
              key={w.id}
              className="flex items-start justify-between gap-3 py-2 border-t border-white/5 first:border-0"
            >
              <div className="flex-1">
                <div className="text-sm text-white">{w.label}</div>
                <div className="text-xs text-foreground-subtle">{w.description}</div>
              </div>
              <button
                onClick={() => trigger(w.id)}
                disabled={busy === w.id}
                className="text-xs rounded-md bg-white/10 text-white hover:bg-white/15 px-3 py-1.5 disabled:opacity-50"
              >
                {busy === w.id ? "Dispatching$€¦" : "Run"}
              </button>
            </div>
          ))}
        </div>
      )}

      {message ? (
        <div className="text-xs text-foreground-subtle">{message}</div>
      ) : null}
    </section>
  );
}
