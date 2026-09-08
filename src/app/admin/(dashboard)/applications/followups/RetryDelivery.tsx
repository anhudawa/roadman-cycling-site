"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RetryDelivery({ id, target }: { id: string; target: "email" | "sarah" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return <div className="mt-3"><button disabled={busy} className="min-h-11 rounded-md border border-white/20 px-4 py-2 text-sm text-off-white disabled:opacity-50" onClick={async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/applications/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, target }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Retry failed");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Retry failed"); }
    finally { setBusy(false); }
  }}>{busy ? "Retrying…" : "Retry failed delivery"}</button>{error && <p role="alert" className="mt-2 text-sm text-amber-200">{error}</p>}</div>;
}
