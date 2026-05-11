import { redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getProgressSummary } from "@/lib/method/progress";
import { isModuleUnlocked } from "@/lib/method/access";
import { METHOD_MODULES, type MethodModule } from "@/lib/method/modules";
import {
  METHOD_PHASES,
  getPhaseForWeek,
  type Phase,
} from "@/lib/method/phases";
import { ProgressRing } from "../_components/ProgressRing";
import { ModuleCard } from "../_components/ModuleCard";
import { CurrentModuleCard } from "../_components/CurrentModuleCard";
import { PhaseBadge } from "../_components/PhaseBadge";
import { QuickStats } from "../_components/QuickStats";
import { PhaseSection } from "../_components/PhaseSection";
import { RecentActivity } from "../_components/RecentActivity";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * /method/dashboard — premium dashboard.
 *
 * Layout, top-down:
 *   1. HERO  — greeting (name) + arc cue + animated progress ring
 *   2. STATS — streak / modules complete / minutes invested / day count
 *   3. CONTINUE — big "next module" card (or graduation card)
 *   4. PHASE GRID — 12 modules grouped under their 4 phases
 *   5. RECENT — last few completions
 *   6. SUPPORT line
 *
 * All gating happens in the layout; this page assumes a session.
 */
export default async function MethodDashboard() {
  const session = await getMethodSession();
  if (!session) redirect("/method/login");

  const enrollment = session.enrollment;
  const progress = await getProgressSummary(enrollment.id);

  const nextModule = pickNextModule(enrollment, progress.completedSlugs);
  const allComplete = progress.completedCount === progress.totalCount;
  const referencePhase = getPhaseForWeek(
    nextModule?.weekIndex ?? Math.max(progress.completedCount, 1),
  );
  const dayCount = daysSinceStart(enrollment.dripStartAt ?? enrollment.paidAt);

  return (
    <Container as="section" width="wide" className="pt-10 pb-16 md:pt-16 space-y-12 md:space-y-16">
      <DashboardHero
        firstName={firstNameOf(enrollment.name)}
        phase={referencePhase}
        percent={progress.percentComplete}
        completedCount={progress.completedCount}
        totalCount={progress.totalCount}
      />

      <QuickStats
        stats={[
          {
            label: "Streak",
            value: progress.inOrderStreak.toString(),
            hint: progress.inOrderStreak === 1 ? "module in a row" : "modules in a row",
          },
          {
            label: "Complete",
            value: `${progress.completedCount}/${progress.totalCount}`,
            hint: "modules worked",
          },
          {
            label: "Time invested",
            value: formatMinutes(progress.totalMinutesInvested),
            hint: "across the protocols",
          },
          {
            label: "Days enrolled",
            value: dayCount.toString(),
            hint: "since the system started",
          },
        ]}
      />

      <CurrentModuleCard module={nextModule} allComplete={allComplete} />

      <section aria-label="Modules" className="space-y-12">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
              THE TWELVE
            </p>
            <h2 className="font-heading uppercase text-3xl md:text-4xl">
              The full system, week by week
            </h2>
          </div>
          <p className="text-sm text-foreground-muted max-w-md">
            Work them in order. Every phase builds on the one before — skip a
            stone and the wall doesn&apos;t hold.
          </p>
        </header>

        {METHOD_PHASES.map((phase) => (
          <PhaseSection key={phase.key} phase={phase}>
            {METHOD_MODULES.filter(
              (m) => m.weekIndex >= phase.startWeek && m.weekIndex <= phase.endWeek,
            ).map((module) => {
              const availability = isModuleUnlocked(enrollment, module);
              const completed = progress.completedSlugs.has(module.slug);
              return (
                <li key={module.slug}>
                  <ModuleCard
                    module={module}
                    availability={availability}
                    completed={completed}
                  />
                </li>
              );
            })}
          </PhaseSection>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity completions={progress.completions} />
        <SupportCard />
      </div>
    </Container>
  );
}

interface DashboardHeroProps {
  firstName: string | null;
  phase: Phase;
  percent: number;
  completedCount: number;
  totalCount: number;
}

function DashboardHero({
  firstName,
  phase,
  percent,
  completedCount,
  totalCount,
}: DashboardHeroProps) {
  const greeting = firstName
    ? `Welcome back, ${firstName.toUpperCase()}`
    : "Welcome back";

  return (
    <header className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <PhaseBadge phase={phase} className="mb-4" />
        <h1 className="font-heading uppercase leading-[0.9] text-[clamp(3rem,7vw,6rem)] mb-3">
          {greeting}
        </h1>
        <p className="max-w-xl text-lg text-off-white">{phase.cue}</p>
        <p className="mt-2 max-w-xl text-foreground-muted">
          You&apos;re {completedCount} of {totalCount} modules deep. Keep the
          rhythm — small commits compound.
        </p>
      </div>
      <ProgressRing percent={percent} />
    </header>
  );
}

function SupportCard() {
  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
      <h2 className="font-heading uppercase tracking-wider text-sm text-coral mb-3">
        Need something?
      </h2>
      <p className="text-sm text-foreground-muted mb-4">
        Stuck on a session? Question on the protocol? The fastest answer is the
        community. Anything that needs us — we&apos;re an email away.
      </p>
      <div className="grid gap-2 text-sm">
        <Link
          href="/method/account"
          className="text-coral hover:text-coral-hover underline-offset-4 hover:underline"
        >
          Manage your account →
        </Link>
        <a
          href="mailto:sarah@roadmancycling.com"
          className="text-coral hover:text-coral-hover underline-offset-4 hover:underline"
        >
          Email support →
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */

function firstNameOf(name: string | null): string | null {
  if (!name) return null;
  const first = name.split(" ")[0]?.trim() ?? "";
  return first.length > 0 ? first : null;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function daysSinceStart(start: Date | null): number {
  if (!start) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / DAY_MS));
}

function pickNextModule(
  enrollment: { status: string; dripStartAt: Date | null },
  completed: ReadonlySet<string>,
): MethodModule | null {
  for (const module of METHOD_MODULES) {
    if (completed.has(module.slug)) continue;
    if (!isModuleUnlocked(enrollment, module).unlocked) continue;
    return module;
  }
  // No unlocked-incomplete module: fall back to first incomplete (locked).
  for (const module of METHOD_MODULES) {
    if (!completed.has(module.slug)) return module;
  }
  return null;
}
