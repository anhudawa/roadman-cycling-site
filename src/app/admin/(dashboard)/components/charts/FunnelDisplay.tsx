"use client";

interface FunnelStep {
  label: string;
  value: number;
}

interface FunnelDisplayProps {
  steps: FunnelStep[];
}

export function FunnelDisplay({ steps }: FunnelDisplayProps) {
  if (steps.length === 0) return null;

  const maxValue = steps[0].value;

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
        const conversionFromPrev =
          index > 0 && steps[index - 1].value > 0
            ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
            : null;

        return (
          <div key={step.label}>
            {conversionFromPrev && (
              <div className="flex items-center justify-center gap-2 py-1.5">
                <svg
                  className="w-3 h-3 text-foreground-subtle"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
                <span className="text-xs text-foreground-subtle">
                  {conversionFromPrev}% conversion
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div
                className="h-10 bg-coral/20 border border-coral/30 rounded-lg flex items-center justify-center transition-all"
                style={{
                  width: `${Math.max(widthPct, 20)}%`,
                }}
              >
                <span className="text-sm font-heading text-off-white truncate px-3">
                  {step.value.toLocaleString()}
                </span>
              </div>
              <span className="text-sm text-foreground-muted whitespace-nowrap">
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FunnelDisplay;
