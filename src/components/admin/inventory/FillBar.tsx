"use client";

export function FillBar({
  sold,
  total,
  size = "md",
}: {
  sold: number;
  total: number;
  size?: "sm" | "md";
}) {
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  const color =
    pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-white/20";
  const textColor =
    pct >= 75
      ? "text-green-400"
      : pct >= 50
        ? "text-yellow-400"
        : "text-foreground-subtle";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 rounded-full overflow-hidden ${size === "sm" ? "h-1.5" : "h-2"} bg-white/5`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium tabular-nums ${textColor} ${size === "sm" ? "min-w-[32px]" : "min-w-[48px]"}`}
      >
        {sold}/{total}
      </span>
    </div>
  );
}
