import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { METHOD_TESTIMONIALS } from "@/app/(method)/method/_components/sales/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "What's Next · The Method",
  robots: { index: false, follow: false },
};

/**
 * /method/whats-next
 *
 * The graduate ascension surface. A rider who has worked all twelve
 * modules is the highest-intent prospect on the ladder. This page
 * celebrates the graduation and frames the natural next rung —
 * Not Done Yet ($195/mo coaching) — as ascension, not a second
 * purchase, with an honest self-select up to 1:1 and a no-pressure
 * "keep re-running the Method" exit so it never reads as a dead end.
 *
 * Naming discipline (offer-ladder.ts): Not Done Yet is COACHING.
 * Never community / club / membership.
 */
export default async function MethodWhatsNextPage() {
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch (err) {
    console.error("[method/whats-next] session read failed:", err);
  }
  if (!session) redirect("/method/login");

  const { enrollment } = session;
  const firstName = enrollment.name?.trim().split(/\s+/)[0] ?? null;

  // A few real, on-record results to reinforce. No invented quotes.
  const testimonials = METHOD_TESTIMONIALS.slice(0, 3);

  return (
    <Container
      as="section"
      width="narrow"
      className="py-12 md:py-20 space-y-12 md:space-y-16"
    >
      {/* ── Graduation hero ─────────────────────────────────── */}
      <header className="rounded-xl border border-coral/40 bg-gradient-to-br from-deep-purple/40 via-charcoal/80 to-charcoal p-8 md:p-10 shadow-[0_0_48px_rgba(241,99,99,0.18)]">
        <p className="font-heading text-xs sm:text-sm tracking-[0.3em] text-coral mb-3">
          THE ROADMAN METHOD · GRADUATED
        </p>
        <h1 className="font-heading uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl mb-4">
          {firstName ? `${firstName}, you finished it.` : "You finished it."}
        </h1>
        <p className="text-foreground-muted max-w-xl text-lg">
          Twelve modules. Five pillars. One framework that&apos;s now yours for
          good. You did the hard part — you learned the system and ran it
          end to end. That puts you in rare company.
        </p>
        <p className="mt-4 text-foreground-muted max-w-xl">
          So here&apos;s the honest question: what keeps it sharp from here?
        </p>
      </header>

      {/* ── The ascension case ──────────────────────────────── */}
      <section>
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          WHERE THE METHOD LEADS
        </p>
        <h2 className="font-heading uppercase tracking-wider text-2xl md:text-3xl mb-4">
          You&apos;ve learned the system. Now keep it sharp.
        </h2>
        <p className="text-foreground-muted max-w-xl mb-3">
          The Method gave you the framework. The riders who keep climbing
          don&apos;t walk away with it — they keep weekly eyes on their training
          so it never drifts. That&apos;s the whole point of Not Done Yet: the
          same five-pillar system, now coached live, week after week.
        </p>
        <p className="text-foreground-muted max-w-xl">
          This isn&apos;t a second course to buy. It&apos;s the next rung — you
          already own the thinking, this just keeps a coach&apos;s eye on how
          you apply it.
        </p>
      </section>

      {/* ── Self-select: the two next steps ─────────────────── */}
      <section className="space-y-5">
        <p className="font-heading text-xs tracking-[0.3em] text-coral">
          PICK THE NEXT STEP THAT FITS
        </p>

        {/* (a) Not Done Yet — primary, for most graduates */}
        <div className="rounded-xl border border-coral/40 bg-gradient-to-br from-deep-purple/40 via-charcoal/80 to-charcoal p-6 md:p-8 shadow-[0_0_36px_rgba(241,99,99,0.12)]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            <h3 className="font-heading uppercase tracking-wider text-xl md:text-2xl">
              Not Done Yet
            </h3>
            <span className="font-heading uppercase tracking-wider text-sm text-coral">
              $195/mo · 7-day free trial
            </span>
          </div>
          <p className="text-foreground-muted max-w-xl mb-2">
            For most graduates — riders who want ongoing accountability and
            plan updates so the framework keeps producing. Weekly live coaching
            calls with Anthony, personalised TrainingPeaks plans, the
            five-pillar system kept current, and the private community of
            riders training to the same standard.
          </p>
          <p className="text-sm text-foreground-muted mb-5">
            Start on the 7-day free trial — see a week of coaching before you
            commit to anything.
          </p>
          <Link
            href="/community/not-done-yet?from=method-grad"
            className="inline-flex items-center gap-2 rounded-md bg-coral hover:bg-coral-hover px-6 py-3 font-heading uppercase tracking-wider text-sm text-off-white shadow-[var(--shadow-glow-coral)] transition-all active:scale-[0.97]"
          >
            Start your 7-day Not Done Yet trial →
          </Link>
        </div>

        {/* (b) Inner Circle / 1:1 — secondary, for event-chasers */}
        <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            <h3 className="font-heading uppercase tracking-wider text-xl md:text-2xl">
              Inner Circle · 1:1
            </h3>
            <span className="font-heading uppercase tracking-wider text-sm text-foreground-muted">
              $525/mo · by application
            </span>
          </div>
          <p className="text-foreground-muted max-w-xl mb-5">
            For the graduate chasing one specific, time-bound event who wants
            daily eyes on their data — direct 1:1 work with Anthony, bespoke
            programming, and the tightest line of accountability there is.
            Limited spots, application only.
          </p>
          <Link
            href="/inner-circle"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 hover:border-coral hover:text-coral px-6 py-3 font-heading uppercase tracking-wider text-sm transition-colors active:scale-[0.97]"
          >
            Explore the Inner Circle →
          </Link>
        </div>

        {/* Low-key exit — never a dead end */}
        <div className="rounded-xl border border-white/10 bg-charcoal/40 p-6">
          <p className="text-foreground-muted">
            Not right now? That&apos;s a real answer. The framework is yours —
            run it again into your next event window, re-test against your Week
            1 baseline, and come back when the timing&apos;s right.{" "}
            <Link
              href="/method/dashboard"
              className="text-coral underline-offset-4 hover:underline"
            >
              Back to your dashboard
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Real proof ──────────────────────────────────────── */}
      <section>
        <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
          RIDERS WHO KEPT GOING
        </p>
        <h2 className="font-heading uppercase tracking-wider text-2xl md:text-3xl mb-6">
          The system, in their words.
        </h2>
        <div className="space-y-4">
          {testimonials.map((t) => (
            <figure
              key={t.member}
              className="rounded-xl border border-white/10 bg-charcoal/60 p-6"
            >
              <p className="font-heading uppercase tracking-wider text-coral text-sm mb-2">
                {t.headline}
              </p>
              <blockquote className="text-off-white">
                &ldquo;{t.body}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm text-foreground-muted">
                {t.member}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-sm text-foreground-muted max-w-xl">
          Behind the framework: 100M+ podcast downloads, 1,400+ episodes, and
          the people who actually move performance forward — Professor Stephen
          Seiler, Dan Lorang, Dr. David Dunne, Joe Friel, John Wakefield. Not
          Done Yet is where that work keeps coaching you, week after week.
        </p>
      </section>
    </Container>
  );
}
