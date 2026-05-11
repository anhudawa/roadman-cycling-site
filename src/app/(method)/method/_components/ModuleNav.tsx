import Link from "next/link";
import type { MethodEnrollment } from "@/lib/method/schema";
import { METHOD_MODULES } from "@/lib/method/modules";
import { isModuleUnlocked } from "@/lib/method/access";

interface ModuleNavProps {
  currentSlug: string;
  enrollment: Pick<MethodEnrollment, "status" | "dripStartAt">;
  completedSlugs: ReadonlySet<string>;
}

/**
 * Left-rail navigation on the module page. Lists all 12 modules with
 * status pip (locked / available / completed / current).
 *
 * Pure server component — no interactivity, just decorated <Link>s.
 */
export function ModuleNav({
  currentSlug,
  enrollment,
  completedSlugs,
}: ModuleNavProps) {
  return (
    <nav aria-label="Course modules">
      <p className="font-heading text-xs tracking-[0.3em] text-coral mb-4">
        ALL MODULES
      </p>
      <ol className="space-y-1">
        {METHOD_MODULES.map((module) => {
          const isCurrent = module.slug === currentSlug;
          const isCompleted = completedSlugs.has(module.slug);
          const availability = isModuleUnlocked(enrollment, module);
          const isLocked = !availability.unlocked && !isCurrent;

          const baseClass =
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";
          let stateClass: string;
          if (isCurrent) {
            stateClass = "bg-coral/15 text-coral";
          } else if (isLocked) {
            stateClass = "text-foreground-muted/60 cursor-not-allowed";
          } else if (isCompleted) {
            stateClass = "text-foreground-muted hover:bg-white/5 hover:text-off-white";
          } else {
            stateClass = "text-off-white hover:bg-white/5";
          }

          const statusGlyph = isCompleted ? "✓" : module.weekIndex.toString().padStart(2, "0");

          const inner = (
            <>
              <span
                className={`font-heading text-xs w-7 text-right ${
                  isCurrent
                    ? "text-coral"
                    : isCompleted
                    ? "text-coral"
                    : "text-foreground-muted"
                }`}
                aria-hidden
              >
                {statusGlyph}
              </span>
              <span className="font-heading uppercase tracking-wider truncate">
                {module.title}
              </span>
            </>
          );

          return (
            <li key={module.slug}>
              {isLocked ? (
                <span className={`${baseClass} ${stateClass}`} aria-disabled>
                  {inner}
                </span>
              ) : (
                <Link
                  href={`/method/modules/${module.slug}`}
                  className={`${baseClass} ${stateClass}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
