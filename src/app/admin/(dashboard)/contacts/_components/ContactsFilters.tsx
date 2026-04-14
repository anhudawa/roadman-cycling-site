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
}: {
  initialSearch: string;
  initialOwner: string;
  initialStage: string;
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
        className="px-3 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50 min-w-[220px]"
      />
      <select
        value={initialOwner}
        onChange={(e) => update("owner", e.target.value)}
        className="px-3 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
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
        className="px-3 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus:outline-none focus:border-coral/50"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
