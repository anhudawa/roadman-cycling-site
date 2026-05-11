import { METHOD_MODULES } from "@/lib/method/modules";

interface WeekProgressDotsProps {
  currentSlug: string;
  completedSlugs: ReadonlySet<string>;
}

/**
 * Twelve-dot inline progress strip used on the module page header.
 * Filled coral = done, hollow ring = current, dim grey = not yet.
 *
 * Compact at all viewports — sits inline with the "Week 03 of 12" label.
 */
export function WeekProgressDots({
  currentSlug,
  completedSlugs,
}: WeekProgressDotsProps) {
  return (
    <ol
      className="flex items-center gap-1.5"
      aria-label="Course progress"
    >
      {METHOD_MODULES.map((module) => {
        const isCurrent = module.slug === currentSlug;
        const isComplete = completedSlugs.has(module.slug);
        let className =
          "h-1.5 w-1.5 rounded-full bg-white/15 ring-0 transition-colors";
        if (isComplete) {
          className =
            "h-1.5 w-1.5 rounded-full bg-coral shadow-[0_0_6px_var(--color-coral)]";
        } else if (isCurrent) {
          className =
            "h-2 w-2 rounded-full border-2 border-coral bg-charcoal";
        }
        return (
          <li
            key={module.slug}
            className={className}
            title={`Week ${module.weekIndex.toString().padStart(2, "0")} · ${module.title}`}
          />
        );
      })}
    </ol>
  );
}
