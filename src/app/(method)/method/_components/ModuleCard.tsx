import Link from "next/link";
import type { MethodModule } from "@/lib/method/modules";
import type { ModuleAvailability } from "@/lib/method/access";

interface ModuleCardProps {
  module: MethodModule;
  availability: ModuleAvailability;
  completed: boolean;
}

/**
 * Dashboard card for a single module. Three visible states:
 *   - completed (coral check, slightly dimmed)
 *   - available (default, full colour, hover lifts)
 *   - locked (greyed, calendar icon + "unlocks in N days")
 */
export function ModuleCard({ module, availability, completed }: ModuleCardProps) {
  const weekLabel = module.weekIndex.toString().padStart(2, "0");
  const isLocked = !availability.unlocked;
  const href = `/method/modules/${module.slug}`;

  const wrapperClasses = [
    "group relative block h-full rounded-lg border p-6 transition-all",
    isLocked
      ? "border-white/5 bg-charcoal/30 cursor-not-allowed"
      : completed
      ? "border-coral/30 bg-charcoal/60 hover:border-coral/60"
      : "border-white/10 bg-charcoal/60 hover:border-coral/60 hover:-translate-y-0.5",
  ].join(" ");

  const content = (
    <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 items-baseline">
      <span
        className={`font-heading text-5xl leading-none ${
          isLocked
            ? "text-foreground-muted/40"
            : completed
            ? "text-coral"
            : "text-off-white"
        }`}
        aria-hidden
      >
        {weekLabel}
      </span>
      <div className="min-w-0">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-1 uppercase">
          {module.pillar}
        </p>
        <h3
          className={`font-heading uppercase text-xl leading-tight tracking-wide ${
            isLocked ? "text-foreground-muted" : "text-off-white"
          }`}
        >
          {module.title}
        </h3>
        <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
          {module.oneLiner}
        </p>
        <p className="mt-3 text-xs text-foreground-muted">
          {isLocked
            ? `Opens in ${availability.daysUntilUnlock} day${
                availability.daysUntilUnlock === 1 ? "" : "s"
              }`
            : completed
            ? "✓ Complete"
            : `${module.estimatedReadMinutes} min · Read protocol`}
        </p>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className={wrapperClasses} aria-disabled="true">
        {content}
      </div>
    );
  }
  return (
    <Link href={href} className={wrapperClasses}>
      {content}
    </Link>
  );
}
