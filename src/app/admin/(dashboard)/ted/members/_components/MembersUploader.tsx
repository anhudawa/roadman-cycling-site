"use client";

import { useState } from "react";

const EXAMPLE = `member_id,first_name,topic_tags
alice-123,Alice,"endurance,nutrition"
sean-456,Se√°n,culture
nick-789,Nick,"strength,recovery"`;

interface Result {
  upserted: number;
  failed: Array<{ memberId: string; error: string }>;
  total: number;
}

export function MembersUploader() {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ted/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? res.statusText);
        return;
      }
      setResult(data as Result);
      // Reload the page so the members list refreshes
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-md bg-white/5 border border-white/10 p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-white">Upsert members from CSV</div>
        <div className="text-xs text-foreground-subtle">
          Columns: <code className="px-1 rounded bg-white/5">member_id</code>,
          <code className="mx-1 px-1 rounded bg-white/5">first_name</code>,
          <code className="px-1 rounded bg-white/5">topic_tags</code> (comma-separated inside
          quotes). Existing rows are updated; new rows are inserted.
        </div>
      </div>

      <textarea
        className="w-full min-h-[140px] rounded-md bg-charcoal border border-white/10 p-3 text-xs text-white font-mono"
        placeholder={EXAMPLE}
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        disabled={busy}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={upload}
          disabled={busy || !csv.trim()}
          className="text-sm rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-50"
        >
          {busy ? "Uploading$Ä¶" : "Upsert"}
        </button>
        <button
          onClick={() => setCsv(EXAMPLE)}
          disabled={busy}
          className="text-xs rounded-md bg-white/10 text-foreground-subtle hover:text-white hover:bg-white/15 px-3 py-1.5"
        >
          Paste example
        </button>
      </div>

      {error ? (
        <div className="text-xs text-[var(--color-bad)]">Upload failed: {error}</div>
      ) : null}
      {result ? (
        <div className="text-xs text-emerald-300">
          Upserted {result.upserted} / {result.total}.
          {result.failed.length > 0 ? (
            <ul className="mt-1 text-[var(--color-bad)]">
              {result.failed.slice(0, 5).map((f) => (
                <li key={f.memberId}>
                  {f.memberId}: {f.error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
