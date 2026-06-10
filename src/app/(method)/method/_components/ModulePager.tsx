import Link from "next/link";
import {
  METHOD_MODULES,
  type MethodModule,
} from "@/lib/method/modules";
import { isModuleUnlocked } from "@/lib/method/access";
import type { MethodEnrollment } from "@/lib/method/schema";

interface ModulePagerProps {
  currentSlug: string;
  enrollment: Pick<MethodEnrollment, "status" | "dripStartAt">;
}

/**
 * Previous / Next navigation at the bottom of a module page. Skips
 * locked modules — there's no point teasing a card the rider can't
 * open. If the next module isn't unlocked yet, the slot becomes a
 * "More to come" placeholder pointing back to the dashboard.
 */
export function ModulePager({ currentSlug, enrollment }: ModulePagerProps) {
  const currentIndex = METHOD_MODULES.findIndex((m) => m.slug === currentSlug);
  const previous = currentIndex > 0 ? METHOD_MODULES[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < METHOD_MODULES.length - 1
      ? METHOD_MODULES[currentIndex + 1]
      : null;

  const nextUnlocked =
    next && isModuleUnlocked(enrollment, next).unlocked;

  return (
    <nav
      aria-label="Module navigation"
      className="grid gap-3 md:grid-cols-2 mt-12 pt-8 border-t border-white/5"
    >
      <PagerSlot module={previous} direction="previous" available={!!previous} />
      <PagerSlot module={next} direction="next" available={!!nextUnlocked} />
    </nav>
  );
}

interface PagerSlotProps {
  module: MethodModule | null;
  direction: "previous" | "next";
  available: boolean;
}

function PagerSlot({ module, direction, available }: PagerSlotProps) {
  const isNext = direction === "next";
  const arrow = isNext ? "→" : "←";
  const label = isNext ? "Next" : "Previous";
  const align = isNext ? "md:text-right md:items-end" : "items-start";

  if (!module) {
    return <div aria-hidden className="hidden md:block" />;
  }

  const inner = (
    <div className={`flex flex-col gap-1 ${align}`}>
      <span className="font-heading text-[11px] tracking-[0.3em] text-coral">
        {isNext ? `${label} ${arrow}` : `${arrow} ${label}`}
      </span>
      <span className="font-heading uppercase text-lg md:text-xl text-off-white">
        Week {module.weekIndex.toString().padStart(2, "0")} · {module.title}
      </span>
      {!available && (
        <span className="text-[11px] text-foreground-muted">
          Opens once you&apos;ve worked the current week.
        </span>
      )}
    </div>
  );

  if (!available) {
    return (
      <div className="rounded-lg border border-white/5 bg-charcoal/30 px-5 py-5 cursor-not-allowed">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/method/modules/${module.slug}`}
      className="rounded-lg border border-white/10 bg-charcoal/60 px-5 py-5 hover:border-coral/50 hover:bg-charcoal/80 transition-all"
    >
      {inner}
    </Link>
  );
}
