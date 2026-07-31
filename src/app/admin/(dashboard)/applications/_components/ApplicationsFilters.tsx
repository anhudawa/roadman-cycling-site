"use client";

import { useRouter } from "next/navigation";
import { formatApplicationMonth } from "@/lib/crm/application-month";

interface Props {
  view: "kanban" | "list";
  cohorts: string[];
  months: string[];
  cohort: string;
  month: string;
}

export function ApplicationsFilters({
  view,
  cohorts,
  months,
  cohort,
  month,
}: Props) {
  const router = useRouter();

  function update(next: { cohort?: string; month?: string }) {
    const params = new URLSearchParams();
    if (view === "list") params.set("view", "list");

    const nextCohort = next.cohort ?? cohort;
    const nextMonth = next.month ?? month;
    if (nextCohort !== "all") params.set("cohort", nextCohort);
    if (nextMonth !== "all") params.set("month", nextMonth);

    const query = params.toString();
    router.replace(`/admin/applications${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <label className="flex items-center gap-2">
        <span className="text-foreground-subtle text-xs tracking-widest uppercase">
          Cohort
        </span>
        <select
          value={cohort}
          onChange={(event) => update({ cohort: event.target.value })}
          className="h-9 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] text-sm rounded-[var(--radius-admin-md)] px-3 focus-ring focus:border-[var(--color-border-focus)]"
        >
          <option value="all">All cohorts</option>
          {cohorts.map((value) => (
            <option key={value} value={value}>
              {value === "inner-circle" ? "Inner Circle" : value}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-foreground-subtle text-xs tracking-widest uppercase">
          Applied
        </span>
        <select
          value={month}
          onChange={(event) => update({ month: event.target.value })}
          className="h-9 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] text-[var(--color-fg)] text-sm rounded-[var(--radius-admin-md)] px-3 focus-ring focus:border-[var(--color-border-focus)]"
        >
          <option value="all">All months</option>
          {months.map((value) => (
            <option key={value} value={value}>
              {formatApplicationMonth(value)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
