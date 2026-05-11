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
  type MethodModule,
} from "@/lib/method/modules";
import { ModuleNav } from "../../_components/ModuleNav";
import { VideoEmbed } from "../../_components/VideoEmbed";
import { ResourceList } from "../../_components/ResourceList";
import { CompleteToggle } from "../../_components/CompleteToggle";
import { DiscussionCTA } from "../../_components/DiscussionCTA";
import { LockedModuleNotice } from "../../_components/LockedModuleNotice";

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
 * Module page template. Two-column on desktop:
 *   - Left (8 cols): video → protocol body
 *   - Right (4 cols): resources, discussion CTA, complete toggle
 *
 * Locked modules show LockedModuleNotice rather than the body. The
 * "mark complete" mutation is a client component; the rest is server-
 * rendered for fast first paint.
 */
export default async function MethodModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = METHOD_MODULE_BY_SLUG.get(slug);
  if (!module) notFound();

  const session = await getMethodSession();
  if (!session) redirect("/method/login");

  const availability = isModuleUnlocked(session.enrollment, module);
  const progress = await getProgressSummary(session.enrollment.id);
  const isComplete = progress.completedSlugs.has(module.slug);

  return (
    <Container as="article" width="wide" className="pt-10 pb-12">
      <Link
        href="/method"
        className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-coral mb-8"
      >
        ← All modules
      </Link>

      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ModuleNav
            currentSlug={module.slug}
            enrollment={session.enrollment}
            completedSlugs={progress.completedSlugs}
          />
        </aside>

        <div className="grid gap-8 lg:grid-cols-12">
          <header className="lg:col-span-12">
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-2">
              WEEK {module.weekIndex.toString().padStart(2, "0")} ·{" "}
              {module.pillar.toUpperCase()}
            </p>
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end">
              <span
                className="font-heading text-[clamp(5rem,12vw,9rem)] leading-none text-coral/70 select-none"
                aria-hidden
              >
                {module.weekIndex.toString().padStart(2, "0")}
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
          </header>

          {!availability.unlocked ? (
            <LockedModuleNotice
              availability={availability}
              className="lg:col-span-12"
            />
          ) : (
            <>
              <div className="lg:col-span-8 space-y-8">
                <VideoEmbed
                  youTubeId={module.videoYouTubeId}
                  title={module.title}
                />
                <ProtocolPlaceholder module={module} />
              </div>
              <aside className="lg:col-span-4 space-y-6">
                <CompleteToggle
                  moduleSlug={module.slug}
                  initialComplete={isComplete}
                />
                <ResourceList resources={module.resources} />
                <DiscussionCTA
                  moduleTitle={module.title}
                  weekIndex={module.weekIndex}
                  url={module.discussionUrl}
                />
              </aside>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

function ProtocolPlaceholder({ module }: { module: MethodModule }) {
  if (module.protocolMdxPath) {
    // Phase 2: render the MDX from content/method/{slug}.mdx via
    // next-mdx-remote (already in deps). Phase 1 ships placeholder.
    return null;
  }
  return (
    <section className="rounded-lg border border-white/10 bg-charcoal/60 p-6 md:p-8">
      <h2 className="font-heading uppercase tracking-wider text-2xl mb-4">
        Protocol
      </h2>
      <p className="text-foreground-muted leading-relaxed mb-3">
        Written protocol for this module is being finalised. When it
        publishes, you'll see the full breakdown here — the work, the why,
        and how it sits inside the twelve-week build.
      </p>
      <p className="text-sm text-foreground-muted">
        Approximate read: {module.estimatedReadMinutes} min when published.
      </p>
    </section>
  );
}
