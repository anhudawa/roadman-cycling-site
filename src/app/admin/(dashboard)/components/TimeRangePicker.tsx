"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "All", value: "all" },
];

export function TimeRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRange = searchParams.get("range") || "30d";

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {RANGES.map((range) => {
        const isActive = activeRange === range.value;
        return (
          <button
            key={range.value}
            onClick={() => handleClick(range.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}

export default TimeRangePicker;
