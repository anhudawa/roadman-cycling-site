"use client";

import type { GapSeverity, RaceRecipe } from "@/lib/ridezones/types";

const SEVERITY_STYLES: Record<GapSeverity, { chip: string; label: string }> = {
  major: { chip: "bg-coral/15 text-coral", label: "Missing" },
  minor: { chip: "bg-[#D99A2B]/15 text-[#EFC272]", label: "Slipping" },
  ok: { chip: "bg-[#1FA396]/15 text-[#5FD4C8]", label: "On track" },
};

function formatRange(start: string, end: string): string {
  const opts = { day: "numeric", month: "short", timeZone: "UTC" } as const;
  const s = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-GB", opts);
  const e = new Date(`${end}T00:00:00Z`).toLocaleDateString("en-GB", opts);
  return `${s} – ${e}`;
}

export function RecipeCompare({ recipe }: { recipe: RaceRecipe }) {
  if (!recipe.best || !recipe.current) {
    return <p className="text-sm leading-relaxed text-foreground-muted">{recipe.headline}</p>;
  }

  return (
    <div>
      <p className="mb-5 text-base leading-relaxed text-off-white">{recipe.headline}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-foreground-muted">
              <th className="py-2 pr-3 font-normal">Ingredient</th>
              <th className="py-2 pr-3 font-normal">
                Best block
                <span className="ml-2 text-xs text-foreground-subtle">
                  {formatRange(recipe.best.startDate, recipe.best.endDate)}
                </span>
              </th>
              <th className="py-2 pr-3 font-normal">Last 6 weeks</th>
              <th className="py-2 font-normal">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {recipe.gaps.map((gap) => {
              const style = SEVERITY_STYLES[gap.severity];
              return (
                <tr key={gap.key} className="border-b border-white/5 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-off-white">{gap.label}</p>
                    <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-foreground-subtle">
                      {gap.note}
                    </p>
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap text-off-white">{gap.bestValue}</td>
                  <td className="py-3 pr-3 whitespace-nowrap text-off-white">{gap.currentValue}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}>
                      {style.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
