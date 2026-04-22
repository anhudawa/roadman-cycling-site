"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const OWNERS = [
  { value: "", label: "All owners" },
  { value: "unassigned", label: "Unassigned" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
  { value: "ted", label: "Ted" },
];

const STAGES = [
  { value: "", label: "All stages" },
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

export function ContactsFilters({
  initialSearch,
  initialOwner,
  initialStage,
  initialStale,
}: {
  initialSearch: string;
  initialOwner: string;
  initialStage: string;
  initialStale?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/admin/contacts?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        placeholder="Search name or email..."
        defaultValue={initialSearch}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", e.currentTarget.value);
        }}
        onBlur={(e) => {
          if (e.currentTarget.value !== initialSearch) update("search", e.currentTarget.value);
        }}
        className="px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)] min-w-[220px]"
      />
      <select
        value={initialOwner}
        onChange={(e) => update("owner", e.target.value)}
        className="px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
      >
        {OWNERS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={initialStage}
        onChange={(e) => update("stage", e.target.value)}
        className="px-3 py-2 text-sm bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] rounded-[var(--radius-admin-md)] focus-ring focus:border-[var(--color-border-focus)]"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => update("stale", initialStale ? "" : "1")}
        className={`px-3 py-2 font-body font-semibold text-[13px] rounded-[var(--radius-admin-md)] border transition ${
          initialStale
            ? "bg-[var(--color-raised)] text-[var(--color-fg)] border-[var(--color-border-strong)] shadow-inner"
            : "bg-[var(--color-elevated)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
        }`}
        aria-pressed={initialStale ? "true" : "false"}
      >
        Stale only
      </button>
    </div>
  );
}
