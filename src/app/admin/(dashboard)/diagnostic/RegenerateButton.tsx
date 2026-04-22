"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Client-side POST to the admin-gated regenerate endpoint, with a
 * router refresh on success so the new breakdown source/flags show
 * up in the admin list immediately.
 */
export function RegenerateButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setStatus("loading");
    setMsg(null);
    try {
      const res = await fetch(`/api/diagnostic/${slug}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("error");
        setMsg(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={status === "loading"}
        className="text-xs text-foreground-subtle hover:text-[var(--color-fg)] disabled:opacity-50 cursor-pointer"
      >
        {status === "loading" ? "…" : "Regenerate"}
      </button>
      {status === "error" && msg && (
        <span className="text-[10px] text-red-400" title={msg}>
          failed
        </span>
      )}
    </span>
  );
}
