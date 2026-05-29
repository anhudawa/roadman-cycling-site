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

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * /method/dashboard — premium dashboard.
 *
 * Auth gating is in the middleware. The session read here is for
 * data — if it fails, we redirect to login as a safety net.
 */
export default async function MethodDashboard() {
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/dashboard] session read failed:", err);
  }
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
    <Container as="section" width="wide" className="pt-8 pb-16 md:pt-16 space-y-10 md:space-y-16">
      {allComplete && <GraduationBanner firstName={firstNameOf(enrollment.name)} />}

      <DashboardHero
        firstName={firstNameOf(enrollment.name)}
        phase={referencePhase}
        percent={progress.percentComplete}
        completedCount={progress.completedCount}
        totalCount={progress.totalCount}
        allComplete={allComplete}
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
        <RiderProfileTile />
        <FuelPlannerTile />
      </div>

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
  allComplete: boolean;
}

function DashboardHero({
  firstName,
  phase,
  percent,
  completedCount,
  totalCount,
  allComplete,
}: DashboardHeroProps) {
  const greeting = firstName
    ? `Welcome back, ${firstName.toUpperCase()}`
    : "Welcome back";

  return (
    <header className="grid gap-8 md:gap-10 md:grid-cols-[1fr_auto] md:items-end">
      <div className="min-w-0">
        <PhaseBadge phase={phase} className="mb-4" />
        <h1 className="font-heading uppercase leading-[0.9] text-[clamp(2.5rem,7vw,6rem)] mb-3">
          {greeting}
        </h1>
        <p className="max-w-xl text-base sm:text-lg text-off-white">{phase.cue}</p>
        <p className="mt-2 max-w-xl text-sm sm:text-base text-foreground-muted">
          {allComplete ? (
            <>
              You&apos;ve worked all twelve. Re-run any module any time — the
              system is yours.
            </>
          ) : (
            <>
              You&apos;re {completedCount} of {totalCount} modules deep. Keep
              the rhythm — small commits compound.
            </>
          )}
        </p>
      </div>
      <div className="self-start md:self-end">
        <ProgressRing percent={percent} />
      </div>
    </header>
  );
}

function GraduationBanner({ firstName }: { firstName: string | null }) {
  const name = firstName ? `, ${firstName.toUpperCase()}` : "";
  return (
    <section
      aria-label="All modules complete"
      className="relative overflow-hidden rounded-xl border border-coral/40 bg-gradient-to-br from-deep-purple/40 via-charcoal to-charcoal p-6 md:p-8 motion-safe:animate-fade-in"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(241,99,99,0.18)_0%,_transparent_55%)]"
      />
      <div className="relative grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
        <span
          aria-hidden
          className="font-heading text-5xl md:text-6xl text-coral leading-none"
        >
          12/12
        </span>
        <div>
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
            GRADUATED · YOU FINISHED THE METHOD
          </p>
          <h2 className="font-heading uppercase leading-[0.95] text-2xl md:text-4xl mb-2">
            Twelve weeks. Done{name}.
          </h2>
          <p className="text-foreground-muted max-w-2xl">
            You&apos;re not following a plan anymore — you&apos;re running the
            system. Every module stays open for life: re-run a phase before
            your next event, or hand the framework to a training partner.
          </p>
        </div>
      </div>
    </section>
  );
}

function RiderProfileTile() {
  return (
    <section
      aria-label="Rider profile"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-deep-purple/30 via-charcoal to-charcoal p-6 md:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(241,99,99,0.12)_0%,_transparent_60%)]"
      />
      <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
            START HERE · RIDER PROFILE
          </p>
          <h2 className="font-heading uppercase leading-[0.95] text-2xl md:text-3xl mb-2">
            Tune the system to you.
          </h2>
          <p className="text-foreground-muted max-w-xl">
            Three minutes on your goal, your hours and your history. It sets
            how you run the twelve weeks — and, on Premium, the plan we build
            around your Week-1 audit.
          </p>
        </div>
        <Link
          href="/method/onboarding"
          className="self-start md:self-center font-heading uppercase tracking-wider text-sm bg-coral text-charcoal hover:bg-coral-hover px-5 py-3 rounded-sm transition-colors whitespace-nowrap"
        >
          Build my profile →
        </Link>
      </div>
    </section>
  );
}

function FuelPlannerTile() {
  return (
    <section
      aria-label="Fuel planner"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-deep-purple/30 via-charcoal to-charcoal p-6 md:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(241,99,99,0.12)_0%,_transparent_60%)]"
      />
      <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
            NEW · FUEL PLANNER
          </p>
          <h2 className="font-heading uppercase leading-[0.95] text-2xl md:text-3xl mb-2">
            Eat for the work required.
          </h2>
          <p className="text-foreground-muted max-w-xl">
            A 12-week fuelling calendar mapped to your training. Daily macros
            and in-ride carbs prescribed session by session — built on the
            Hexis FFTWR methodology.
          </p>
        </div>
        <Link
          href="/method/fuel-planner"
          className="self-start md:self-center font-heading uppercase tracking-wider text-sm bg-coral text-charcoal hover:bg-coral-hover px-5 py-3 rounded-sm transition-colors whitespace-nowrap"
        >
          Open planner →
        </Link>
      </div>
    </section>
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
