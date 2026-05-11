import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getProgressSummary } from "@/lib/method/progress";
import { isModuleUnlocked } from "@/lib/method/access";
import {
  METHOD_MODULES,
  METHOD_MODULE_BY_SLUG,
  METHOD_TOTAL_MODULES,
  type MethodModule,
  type ResourceLink,
} from "@/lib/method/modules";
import { getPhaseForWeek } from "@/lib/method/phases";
import { ModuleNav } from "../../_components/ModuleNav";
import { VideoEmbed } from "../../_components/VideoEmbed";
import { ResourceList } from "../../_components/ResourceList";
import { CompleteToggle } from "../../_components/CompleteToggle";
import { DiscussionCTA } from "../../_components/DiscussionCTA";
import { LockedModuleNotice } from "../../_components/LockedModuleNotice";
import { PhaseBadge } from "../../_components/PhaseBadge";
import { TrainingPeaksCallout } from "../../_components/TrainingPeaksCallout";
import { ModulePager } from "../../_components/ModulePager";
import { WeekProgressDots } from "../../_components/WeekProgressDots";
import { MethodProtocol } from "../../_components/MethodProtocol";
import { LearningOutcomes } from "../../_components/LearningOutcomes";
import { WeekChecklist } from "../../_components/WeekChecklist";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return METHOD_MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const module = METHOD_MODULE_BY_SLUG.get(slug);
  if (!module) return { title: "The Method" };
  return {
    title: `${module.weekIndex.toString().padStart(2, "0")} · ${module.title} · The Method`,
    description: module.oneLiner,
    robots: { index: false, follow: false },
  };
}

/**
 * /method/modules/[slug]
 *
 * Module page. Two-column on desktop:
 *   - Left rail (260px): module nav (12 items, status pips)
 *   - Right column: header → outcomes → video → protocol → checklist → pager
 *     With a sticky-ish sidebar (Complete / Resources / TP / Discuss)
 *     on lg+ screens.
 *
 * Locked modules show LockedModuleNotice in place of the body.
 */
export default async function MethodModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = METHOD_MODULE_BY_SLUG.get(slug);
  if (!module) notFound();

  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/module] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  const availability = isModuleUnlocked(session.enrollment, module);
  const progress = await getProgressSummary(session.enrollment.id);
  const isComplete = progress.completedSlugs.has(module.slug);
  const phase = getPhaseForWeek(module.weekIndex);
  const trainingPeaksResource = module.resources.find(
    (r): r is Extract<ResourceLink, { kind: "training-peaks" }> =>
      r.kind === "training-peaks",
  );

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(241,99,99,0.10),_transparent_60%)]" />
        <div className="absolute top-24 right-[-120px] h-[360px] w-[360px] rounded-full bg-deep-purple/30 blur-3xl" />
      </div>

      <Container as="article" width="wide" className="pt-10 pb-16">
        <Link
          href="/method"
          className="group inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-coral mb-6 transition-colors"
        >
          <span
            aria-hidden
            className="inline-block transition-transform group-hover:-translate-x-0.5"
          >
            ←
          </span>
          All modules
        </Link>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start motion-safe:animate-fade-in">
            <ModuleNav
              currentSlug={module.slug}
              enrollment={session.enrollment}
              completedSlugs={progress.completedSlugs}
            />
          </aside>

          <div className="grid gap-10 lg:grid-cols-12">
            <ModuleHeader
              module={module}
              phase={phase}
              completedSlugs={progress.completedSlugs}
            />

            {!availability.unlocked ? (
              <div className="lg:col-span-12 motion-safe:animate-slide-up">
                <LockedModuleNotice availability={availability} />
              </div>
            ) : (
              <>
                <div
                  className="lg:col-span-8 space-y-8 motion-safe:animate-slide-up"
                  style={{ animationDelay: "60ms" }}
                >
                  <LearningOutcomes outcomes={module.learningOutcomes} />
                  <VideoEmbed
                    youTubeId={module.videoYouTubeId}
                    title={module.title}
                  />
                  <MethodProtocol module={module} />
                  <WeekChecklist
                    moduleSlug={module.slug}
                    items={module.checklist}
                  />
                </div>
                <aside
                  className="lg:col-span-4 space-y-5 motion-safe:animate-slide-up"
                  style={{ animationDelay: "120ms" }}
                >
                  <CompleteToggle
                    moduleSlug={module.slug}
                    initialComplete={isComplete}
                  />
                  {trainingPeaksResource && (
                    <TrainingPeaksCallout resource={trainingPeaksResource} />
                  )}
                  <ResourceList resources={module.resources} />
                  <DiscussionCTA
                    moduleTitle={module.title}
                    weekIndex={module.weekIndex}
                    url={module.discussionUrl}
                  />
                </aside>
              </>
            )}

            <div className="lg:col-span-12">
              <ModulePager
                currentSlug={module.slug}
                enrollment={session.enrollment}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

interface ModuleHeaderProps {
  module: MethodModule;
  phase: ReturnType<typeof getPhaseForWeek>;
  completedSlugs: ReadonlySet<string>;
}

function ModuleHeader({ module, phase, completedSlugs }: ModuleHeaderProps) {
  const week = module.weekIndex.toString().padStart(2, "0");
  return (
    <header className="lg:col-span-12 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <PhaseBadge phase={phase} size="sm" />
        <span className="font-heading text-[11px] tracking-[0.3em] text-foreground-muted uppercase">
          Week {week} of {METHOD_TOTAL_MODULES.toString().padStart(2, "0")} ·{" "}
          {module.pillar}
        </span>
      </div>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end">
        <span
          className="font-heading text-[clamp(5rem,12vw,9rem)] leading-none text-coral/70 select-none"
          aria-hidden
        >
          {week}
        </span>
        <div>
          <h1 className="font-heading uppercase leading-[0.95] text-[clamp(2.5rem,5vw,4.5rem)] mb-3">
            {module.title}
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            {module.oneLiner}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <WeekProgressDots
          currentSlug={module.slug}
          completedSlugs={completedSlugs}
        />
        <span className="text-[11px] text-foreground-muted">
          {module.estimatedReadMinutes} min protocol · video + downloads
        </span>
      </div>
    </header>
  );
}
