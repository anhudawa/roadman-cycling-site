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
 * Module navigation rail. On desktop (lg+) it renders as an always-open
 * left rail. On mobile it collapses to a `<details>` block that opens
 * to the current module by default, so the user lands looking at the
 * module they're working on.
 */
export function ModuleNav({
  currentSlug,
  enrollment,
  completedSlugs,
}: ModuleNavProps) {
  const currentModule = METHOD_MODULES.find((m) => m.slug === currentSlug);
  const currentLabel = currentModule
    ? `Module ${currentModule.weekIndex.toString().padStart(2, "0")} · ${currentModule.title}`
    : "All modules";

  const list = (
    <ol className="space-y-1 lg:mt-4">
      {METHOD_MODULES.map((module) => {
        const isCurrent = module.slug === currentSlug;
        const isCompleted = completedSlugs.has(module.slug);
        const availability = isModuleUnlocked(enrollment, module);
        const isLocked = !availability.unlocked && !isCurrent;

        const baseClass =
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";
        let stateClass: string;
        if (isCurrent) {
          stateClass =
            "bg-coral/15 text-coral ring-1 ring-inset ring-coral/40";
        } else if (isLocked) {
          stateClass = "text-foreground-muted/60 cursor-not-allowed";
        } else if (isCompleted) {
          stateClass =
            "text-foreground-muted hover:bg-white/5 hover:text-off-white";
        } else {
          stateClass = "text-off-white hover:bg-white/5";
        }

        const statusGlyph = isCompleted
          ? "✓"
          : module.weekIndex.toString().padStart(2, "0");

        const inner = (
          <>
            <span
              className={`font-heading text-xs w-7 text-right ${
                isCurrent || isCompleted ? "text-coral" : "text-foreground-muted"
              }`}
              aria-hidden
            >
              {statusGlyph}
            </span>
            <span className="font-heading uppercase tracking-wider truncate">
              {module.title}
            </span>
            {isCurrent && (
              <span className="ml-auto text-[10px] font-heading tracking-[0.2em] text-coral/80">
                NOW
              </span>
            )}
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
  );

  return (
    <nav aria-label="Course modules">
      <details className="lg:hidden group rounded-lg border border-white/10 bg-charcoal/60 overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-white/5">
          <div className="min-w-0">
            <p className="font-heading text-[10px] tracking-[0.3em] text-coral mb-0.5">
              ALL MODULES
            </p>
            <p className="font-heading uppercase tracking-wider text-sm text-off-white truncate">
              {currentLabel}
            </p>
          </div>
          <span
            aria-hidden
            className="font-heading text-coral text-lg leading-none transition-transform group-open:rotate-180"
          >
            ⌄
          </span>
        </summary>
        <div className="border-t border-white/10 px-2 py-3">{list}</div>
      </details>

      <div className="hidden lg:block">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
          ALL MODULES
        </p>
        {list}
      </div>
    </nav>
  );
}
