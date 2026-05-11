import Link from "next/link";
import { METHOD_MODULE_BY_SLUG } from "@/lib/method/modules";
import type { ProgressCompletion } from "@/lib/method/progress";

interface RecentActivityProps {
  completions: readonly ProgressCompletion[];
  limit?: number;
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeFromNow(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    if (Math.abs(diffHours) < 1) return "just now";
    return RTF.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 14) return RTF.format(diffDays, "day");
  return RTF.format(Math.round(diffDays / 7), "week");
}

export function RecentActivity({ completions, limit = 4 }: RecentActivityProps) {
  if (completions.length === 0) return null;
  const recent = completions.slice(0, limit);

  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-4">
        Recent work
      </h2>
      <ol className="space-y-3">
        {recent.map((row) => {
          const module = METHOD_MODULE_BY_SLUG.get(row.slug);
          if (!module) return null;
          return (
            <li key={row.slug}>
              <Link
                href={`/method/modules/${module.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 rounded-md py-1 px-1 -mx-1 hover:bg-white/5"
              >
                <span
                  aria-hidden
                  className="font-heading text-xs tracking-wider text-coral w-8"
                >
                  {module.weekIndex.toString().padStart(2, "0")}
                </span>
                <span className="font-heading uppercase tracking-wide text-off-white truncate group-hover:text-coral transition-colors">
                  {module.title}
                </span>
                <span className="text-[11px] text-foreground-muted whitespace-nowrap">
                  {relativeFromNow(row.completedAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
