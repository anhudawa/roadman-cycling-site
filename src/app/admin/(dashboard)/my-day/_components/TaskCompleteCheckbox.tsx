"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  taskId: number;
  completed: boolean;
}

export function TaskCompleteCheckbox({ taskId, completed }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState(completed);

  async function toggle() {
    setBusy(true);
    setOptimistic(!optimistic);
    try {
      const res = await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) {
        setOptimistic(completed);
      } else {
        startTransition(() => router.refresh());
      }
    } catch {
      setOptimistic(completed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || pending}
      aria-label={optimistic ? "Mark incomplete" : "Mark complete"}
      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
        optimistic ? "bg-[var(--color-good)] border-[var(--color-good)]" : "border-[var(--color-border-strong)] hover:border-[var(--color-fg)]"
      } ${busy ? "opacity-60" : ""}`}
    >
      {optimistic && (
        <svg
          className="w-3 h-3 text-off-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      )}
    </button>
  );
}
