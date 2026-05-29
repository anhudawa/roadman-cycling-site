import Link from "next/link";
import type { MethodModule } from "@/lib/method/modules";
import { getPhaseForWeek } from "@/lib/method/phases";

interface CurrentModuleCardProps {
  /** The next available, incomplete module — null if everything is done. */
  module: MethodModule | null;
  /** True when every module is marked complete. */
  allComplete: boolean;
}

/**
 * The big "Continue where you left off" card on the dashboard. Sits
 * above the full grid. Distinguished from grid cards by:
 *   - full-width
 *   - oversized week numeral on the left
 *   - explicit Continue CTA with coral glow
 *   - phase tag + estimated read time
 *
 * On graduation (allComplete) it transforms into a "Method complete"
 * celebration card that points at module 12 and the Not Done Yet
 * community as the natural next step.
 */
export function CurrentModuleCard({ module, allComplete }: CurrentModuleCardProps) {
  if (allComplete) {
    return (
      <section className="rounded-xl border border-coral/40 bg-gradient-to-br from-deep-purple/40 via-charcoal/80 to-charcoal p-8 md:p-10 shadow-[0_0_48px_rgba(241,99,99,0.18)]">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          NOT DONE YET
        </p>
        <h2 className="font-heading uppercase leading-[0.95] text-3xl md:text-5xl mb-4">
          Twelve weeks. One framework. Yours now.
        </h2>
        <p className="text-foreground-muted max-w-2xl mb-6">
          You&apos;ve worked every module. The system is in your hands. The riders
          who keep climbing don&apos;t stop here — they keep sharpening it
          inside Not Done Yet: weekly calls with Anthony, updated TrainingPeaks
          plans, and the cohort that&apos;s been through the same work.
          Your 7-day trial is waiting.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link
            href="/community/not-done-yet?from=method-grad"
            className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-6 py-3 font-heading uppercase tracking-wider text-off-white shadow-[var(--shadow-glow-coral)] transition-all"
          >
            Continue into Not Done Yet →
          </Link>
          <Link
            href="/method/account"
            className="text-sm text-foreground-muted hover:text-off-white underline underline-offset-4"
          >
            Manage your account
          </Link>
        </div>
      </section>
    );
  }

  if (!module) return null;

  const phase = getPhaseForWeek(module.weekIndex);
  const week = module.weekIndex.toString().padStart(2, "0");

  return (
    <section className="relative overflow-hidden rounded-xl border border-coral/30 bg-gradient-to-br from-deep-purple/30 via-charcoal/80 to-charcoal p-6 md:p-10 shadow-[0_0_36px_rgba(241,99,99,0.12)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-coral/10 blur-3xl"
      />
      <div className="relative grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-end">
        <div>
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
            CONTINUE · {phase.label.toUpperCase()}
          </p>
          <span
            className="block font-heading text-[clamp(5rem,12vw,9rem)] leading-none text-coral select-none"
            aria-hidden
          >
            {week}
          </span>
        </div>
        <div>
          <p className="font-heading text-[11px] tracking-[0.3em] text-foreground-muted uppercase mb-2">
            Week {week} · {module.pillar}
          </p>
          <h2 className="font-heading uppercase leading-[0.95] text-3xl md:text-5xl mb-3">
            {module.title}
          </h2>
          <p className="text-foreground-muted max-w-xl">{module.oneLiner}</p>
          <p className="mt-4 text-xs text-foreground-muted">
            {module.estimatedReadMinutes} min protocol · video + downloads
          </p>
        </div>
        <Link
          href={`/method/modules/${module.slug}`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-7 py-4 font-heading uppercase tracking-wider text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
        >
          Continue →
        </Link>
      </div>
    </section>
  );
}
