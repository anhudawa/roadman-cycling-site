import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { isPremiumTier } from "@/lib/method/tiers";
import {
  getTrainingPeaksPlan,
  resolveTrainingPeaksPlanUrl,
} from "@/lib/method/training-peaks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TrainingPeaks Plan · The Method",
  robots: { index: false, follow: false },
};

const PREMIUM_THRESHOLD_CENTS = 35000; // $350+ → Premium tier

/**
 * /method/training-peaks/[slug]
 *
 * Fulfilment surface for the personalised TrainingPeaks plans linked from a
 * module's `kind: "training-peaks"` resources. The slug is a plan-block slug
 * (e.g. "polarised-base"), validated against the module manifest.
 *
 * Auth: enforced at the edge by src/middleware.ts (this path is not in
 * GUEST_PATHS). We still read the session for data and redirect defensively.
 *
 * Gating: a personalised TrainingPeaks plan is a Premium differentiator.
 *   - Premium → outbound CTA to the configured plan URL, or an honest
 *     "being built" state if no URL is configured yet.
 *   - Standard → explains this is a Premium feature, points at the per-block
 *     PDF plan they DO get, and offers a tasteful upgrade path.
 */
export default async function TrainingPeaksFulfilmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const plan = getTrainingPeaksPlan(slug);
  if (!plan) notFound();

  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/training-peaks] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  const enrollment = session.enrollment;
  const isPremium = resolveIsPremium(enrollment);
  const supportEmail =
    process.env.METHOD_SUPPORT_EMAIL ?? "sarah@roadmancycling.com";
  const moduleHref = `/method/modules/${plan.module.slug}`;
  const planUrl = isPremium ? resolveTrainingPeaksPlanUrl(slug) : null;

  return (
    <Container
      as="section"
      width="narrow"
      className="py-12 md:py-20 space-y-10 md:space-y-12"
    >
      <header>
        <p className="font-heading text-xs sm:text-sm tracking-[0.3em] text-coral mb-3">
          TRAININGPEAKS · WEEK{" "}
          {plan.module.weekIndex.toString().padStart(2, "0")}
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl">
          {planLabel(plan.title)}
        </h1>
        <p className="mt-3 text-foreground-muted max-w-lg">
          The structured TrainingPeaks block that pairs with{" "}
          <Link
            href={moduleHref}
            className="text-coral underline-offset-4 hover:underline"
          >
            {plan.module.title}
          </Link>
          .
        </p>
      </header>

      {isPremium ? (
        <PremiumPanel
          planUrl={planUrl}
          planTitle={planLabel(plan.title)}
          supportEmail={supportEmail}
        />
      ) : (
        <StandardPanel
          moduleTitle={plan.module.title}
          moduleHref={moduleHref}
        />
      )}

      <BackLink moduleHref={moduleHref} moduleTitle={plan.module.title} />
    </Container>
  );
}

/**
 * The `tier` column is the source of truth, but rows created before the
 * column existed default to "standard". Mirror account/page.tsx: let a
 * Premium-sized payment override an apparent Standard tier.
 */
function resolveIsPremium(enrollment: {
  tier?: string | null;
  amountCents?: number | null;
}): boolean {
  if (isPremiumTier(enrollment)) return true;
  if (
    typeof enrollment.amountCents === "number" &&
    enrollment.amountCents >= PREMIUM_THRESHOLD_CENTS
  ) {
    return true;
  }
  return false;
}

/** Strip the "Premium plan — " prefix the manifest uses for resource titles. */
function planLabel(title: string): string {
  return title.replace(/^Premium plan\s*[—-]\s*/i, "");
}

/* ─────────────────────────────────────────────────────────── */

function PremiumPanel({
  planUrl,
  planTitle,
  supportEmail,
}: {
  planUrl: string | null;
  planTitle: string;
  supportEmail: string;
}) {
  if (planUrl) {
    return (
      <section className="rounded-xl border border-coral/30 bg-gradient-to-br from-deep-purple/30 via-charcoal/70 to-charcoal p-6 md:p-8">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          YOUR PREMIUM PLAN
        </p>
        <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
          {planTitle}
        </h2>
        <p className="text-foreground-muted mb-6 max-w-xl">
          Your personalised block is live in TrainingPeaks. Open it to pull the
          structured workouts straight onto your calendar and sync them to your
          head unit. The written protocol on the module page tells you the why
          — TrainingPeaks gives you the day-by-day.
        </p>
        <a
          href={planUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-sm text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
        >
          Open your TrainingPeaks plan →
        </a>
        <p className="mt-5 text-sm text-foreground-muted">
          Wrong plan, or can&apos;t see your workouts? Write to{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="text-coral underline-offset-4 hover:underline"
          >
            {supportEmail}
          </a>
          .
        </p>
      </section>
    );
  }

  // Premium, but no URL configured yet — be honest, do not fake a link.
  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
      <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
        YOUR PREMIUM PLAN
      </p>
      <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
        Being built for you
      </h2>
      <p className="text-foreground-muted mb-3 max-w-xl">
        Your personalised{" "}
        <span className="text-off-white">{planTitle}</span> is being put
        together. As a Premium rider it&apos;s tailored to your numbers, not a
        template — so it takes us a little longer to set up.
      </p>
      <p className="text-foreground-muted mb-6 max-w-xl">
        We&apos;ll email you the moment it&apos;s assigned, and it&apos;ll
        appear here automatically. In the meantime, the written protocol and
        the per-block PDF on the module page have everything you need to start
        the work.
      </p>
      <a
        href={`mailto:${supportEmail}?subject=${encodeURIComponent(
          `TrainingPeaks plan: ${planTitle}`,
        )}`}
        className="inline-flex items-center gap-2 rounded-md border border-coral/50 hover:bg-coral hover:text-off-white px-5 py-2.5 font-heading uppercase tracking-wider text-sm text-coral transition-colors active:scale-[0.97]"
      >
        Chase up my plan →
      </a>
    </section>
  );
}

function StandardPanel({
  moduleTitle,
  moduleHref,
}: {
  moduleTitle: string;
  moduleHref: string;
}) {
  const upgradeHref = "/method/account";
  return (
    <>
      <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          A PREMIUM FEATURE
        </p>
        <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
          The personalised TrainingPeaks plan is Premium
        </h2>
        <p className="text-foreground-muted mb-3 max-w-xl">
          A plan built around your numbers and synced to TrainingPeaks is part
          of the Premium tier. It&apos;s genuinely different work to set up, so
          we keep it where it belongs.
        </p>
        <p className="text-foreground-muted max-w-xl">
          Your Standard enrolment still gives you the full block — the written
          protocol, the session library, and the per-block training
          architecture PDFs on the{" "}
          <Link
            href={moduleHref}
            className="text-coral underline-offset-4 hover:underline"
          >
            {moduleTitle}
          </Link>{" "}
          page. Drop those into your own calendar and you have the same
          structure; Premium just hands it to you pre-built.
        </p>
      </section>

      <section className="rounded-xl border border-coral/30 bg-gradient-to-br from-deep-purple/30 via-charcoal/70 to-charcoal p-6 md:p-8">
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          IF YOU WANT IT DONE FOR YOU
        </p>
        <h2 className="font-heading uppercase tracking-wider text-xl md:text-2xl mb-3">
          Two ways to get a personalised plan
        </h2>
        <p className="text-foreground-muted mb-6 max-w-xl">
          No pressure — the Standard work is complete on its own. But if you&apos;d
          rather have the plan built and loaded for you, you can move up to
          Premium, or join Not Done Yet where updated TrainingPeaks plans land
          every block alongside live coaching.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={upgradeHref}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 hover:border-coral hover:text-coral px-5 py-2.5 font-heading uppercase tracking-wider text-sm transition-colors active:scale-[0.97]"
          >
            Upgrade options →
          </Link>
          <Link
            href="/community/not-done-yet?from=method-training-peaks"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-5 py-2.5 font-heading uppercase tracking-wider text-sm text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
          >
            See Not Done Yet →
          </Link>
        </div>
      </section>
    </>
  );
}

function BackLink({
  moduleHref,
  moduleTitle,
}: {
  moduleHref: string;
  moduleTitle: string;
}) {
  return (
    <Link
      href={moduleHref}
      className="inline-flex items-center gap-2 font-heading uppercase tracking-wider text-sm text-foreground-muted hover:text-coral transition-colors"
    >
      ← Back to {moduleTitle}
    </Link>
  );
}
