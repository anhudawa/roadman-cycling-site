"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleRule({ id, initial }: { id: number; initial: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !active;
    setActive(next);
    try {
      const res = await fetch(`/api/admin/crm/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) {
        setActive(!next);
      } else {
        router.refresh();
      }
    } catch {
      setActive(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        active ? "bg-[var(--color-good)]" : "bg-[var(--color-elevated)]"
      }`}
      aria-label={active ? "Deactivate" : "Activate"}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
