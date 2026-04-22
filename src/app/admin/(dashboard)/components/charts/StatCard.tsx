import { SparkLine } from "./SparkLine";

interface StatCardProps {
  value: string | number;
  label: string;
  change?: number;
  changeLabel?: string;
  sparkData?: number[];
  className?: string;
}

export function StatCard({
  value,
  label,
  change,
  changeLabel,
  sparkData,
  className = "",
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? "text-green-400" : "text-[var(--color-bad)]";

  return (
    <div
      className={`bg-background-elevated border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors ${className}`}
    >
      <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 ${changeColor}`}>
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isPositive ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                  />
                )}
              </svg>
              <span className="text-xs font-medium">
                {Math.abs(change).toFixed(1)}%
                {changeLabel ? ` ${changeLabel}` : ""}
              </span>
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <SparkLine data={sparkData} color={isPositive ? "#4ADE80" : "#E8836B"} />
        )}
      </div>
    </div>
  );
}

export default StatCard;
