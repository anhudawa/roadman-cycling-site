import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Footer, Header, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { maskEmail } from "@/lib/admin/events-store";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { CLOSE_TO_BREAKTHROUGH, labelFor } from "@/lib/diagnostic/profiles";
import { resolveBookingUrl, resolveCta } from "@/lib/diagnostic/config";
import { ResultsAnalytics } from "@/components/features/diagnostic/ResultsAnalytics";
import { ShareButton } from "@/components/features/diagnostic/ShareButton";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";
import { ReadingProgress } from "@/components/features/diagnostic/ReadingProgress";
import { StickyCta } from "@/components/features/diagnostic/StickyCta";
import { SuccessBanner } from "@/components/features/diagnostic/SuccessBanner";
import { AskRoadmanHandoff } from "@/components/features/diagnostic/AskRoadmanHandoff";
import type { Breakdown } from "@/lib/diagnostic/types";

/**
 * Results page. Reads straight from the DB on the server so the
 * initial render is already populated — no loading spinner, no
 * client round-trip. Safe to share the URL because slugs are
 * unguessable.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const submission = await getSubmissionBySlug(slug);
  if (!submission) return { title: "Your diagnosis — Roadman Cycling" };

  const label = labelFor(
    submission.primaryProfile,
    submission.closeToBreakthrough
  );

  return {
    title: `Your diagnosis: ${label} — Roadman Cycling`,
    description: submission.breakdown.diagnosis?.slice(0, 160),
    // Results contain personal info in the URL. Don't let search engines
    // index individual diagnosis pages.
    robots: { index: false, follow: false },
  };
}

export default async function DiagnosticResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const submission = await getSubmissionBySlug(slug);
  if (!submission) notFound();

  const isCloseToBreakthrough = submission.closeToBreakthrough;
  const breakdown: Breakdown = isCloseToBreakthrough
    ? CLOSE_TO_BREAKTHROUGH
    : submission.breakdown;
  const profileLabel = labelFor(
    submission.primaryProfile,
    isCloseToBreakthrough
  );

  // Close-to-breakthrough always routes to a direct call. Otherwise
  // use the per-profile matrix from §12.
  const cta = isCloseToBreakthrough
    ? {
        primaryLabel: "Book a 15-minute call with Anthony",
        primaryHref: resolveBookingUrl(),
        secondaryLabel: "",
        secondaryHref: "",
      }
    : resolveCta(submission.primaryProfile, submission.severeMultiSystem);

  return (
    <>
      <ReadingProgress />
      <StickyCta href={cta.primaryHref} label={cta.primaryLabel} />
      {/* SuccessBanner is gated by ?fresh=1 so it only shows on the
          post-submit redirect; Suspense is required because it reads
          useSearchParams. */}
      <Suspense fallback={null}>
        <SuccessBanner emailHint={maskEmail(submission.email)} />
      </Suspense>
      {/* Fires fbq PageView + Lead when the pixel env is configured —
          this is the diagnostic funnel's primary conversion signal. */}
      <MetaPixel
        event="Lead"
        eventParams={{
          content_name: "plateau-diagnostic",
          content_category: submission.primaryProfile,
        }}
      />
      <ResultsAnalytics slug={submission.slug} profile={submission.primaryProfile} />
      <Header />
      <main id="main-content">
        {/* ── Hero diagnosis ─────────────────────────── */}
        <Section background="charcoal" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-widest mb-4">
                YOUR DIAGNOSIS · {profileLabel.toUpperCase()}
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {breakdown.headline}
              </h1>
              <p className="text-off-white/90 text-xl leading-relaxed">
                {breakdown.diagnosis}
              </p>
              {submission.severeMultiSystem && (
                <div className="mt-8 rounded-md bg-coral/10 border border-coral/30 p-4 text-sm text-coral">
                  <strong className="font-semibold">
                    One note before you read on.
                  </strong>{" "}
                  Your answers lit up more than one profile meaningfully.
                  That&rsquo;s rare, and it means I&rsquo;d rather talk than
                  have you self-diagnose off a sales page. Book the call at
                  the bottom.
                </div>
              )}
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── Why this is happening ──────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-6">
                WHY THIS IS HAPPENING
              </h2>
              <div className="prose-roadman text-off-white/90 space-y-4">
                {breakdown.whyThisIsHappening.split("\n\n").map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <h3 className="font-heading text-off-white text-xl md:text-2xl mt-12 mb-4">
                WHAT IT&rsquo;S ACTUALLY COSTING YOU
              </h3>
              <p className="text-off-white/90 leading-relaxed">
                {breakdown.whatItsCosting}
              </p>
            </ScrollReveal>

            {/* Mid-content escape hatch for impatient readers. The
                full fix + handoff is below, but converting here is
                better than a scroll-bounce. */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="mt-10 rounded-lg border border-coral/30 bg-coral/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-foreground-muted text-sm">
                  Already know you want to fix this with help, not more
                  reading?
                </p>
                <a
                  href={cta.primaryHref}
                  data-cta="mid-content"
                  className="shrink-0 font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-5 py-2 rounded-md transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  {cta.primaryLabel.toUpperCase()}
                </a>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── The fix ────────────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-8 text-center">
                THE FIX
              </h2>
            </ScrollReveal>
            {/* Semantic ol for AT users; each list item animates in
                staggered so the three-step structure reads visually. */}
            <ol className="space-y-6 list-none p-0">
              {breakdown.fix.map((step, i) => (
                <li key={step.step}>
                  <ScrollReveal direction="up" delay={i * 0.1}>
                    <div className="bg-background-elevated rounded-xl border border-white/5 p-6 flex gap-4">
                      <div className="font-heading text-3xl text-coral shrink-0 w-10">
                        {step.step}
                      </div>
                      <div>
                        <p className="font-heading text-lg text-off-white mb-2">
                          {step.title}
                        </p>
                        <p className="text-foreground-muted leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        {/* ── Why alone ──────────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-6">
                WHY MOST RIDERS CAN&rsquo;T DO THIS ALONE
              </h2>
              <p className="text-off-white/90 leading-relaxed">
                {breakdown.whyAlone}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── CTA + secondary ────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow" className="text-center space-y-6">
            <h2 className="font-heading text-off-white text-2xl md:text-3xl">
              YOUR NEXT MOVE
            </h2>
            <p className="text-foreground-muted leading-relaxed max-w-xl mx-auto">
              {breakdown.nextMove}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={cta.primaryHref}
                data-cta="primary"
                data-profile={submission.primaryProfile}
                className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-8 py-4 rounded-md transition-colors cursor-pointer text-lg"
              >
                {cta.primaryLabel.toUpperCase()}
              </Link>
              {cta.secondaryHref && (
                <Link
                  href={cta.secondaryHref}
                  data-cta="secondary"
                  className="text-foreground-muted hover:text-off-white text-sm underline underline-offset-4"
                >
                  {cta.secondaryLabel}
                </Link>
              )}
            </div>
            {/* Phase 2 handoff — rider can dig into the result with the
                on-site assistant. Appears below the primary CTA so it
                never competes with a booking/coaching conversion. */}
            <div className="pt-8 mx-auto max-w-xl text-left">
              <AskRoadmanHandoff
                slug={submission.slug}
                profile={submission.primaryProfile}
              />
            </div>
          </Container>
        </Section>

        {/* ── Secondary profile note ─────────────────── */}
        {breakdown.secondaryNote && (
          <Section background="deep-purple">
            <Container width="narrow">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-coral font-heading text-xs tracking-widest mb-2">
                  ALSO IN VIEW
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {breakdown.secondaryNote}
                </p>
              </div>
            </Container>
          </Section>
        )}

        {/* ── Share + footer meta ────────────────────── */}
        <Section background="charcoal" className="pb-24">
          <Container width="narrow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-coral font-heading text-xs tracking-widest mb-1">
                  SAVE FOR LATER
                </p>
                <p className="text-foreground-subtle text-sm">
                  Bookmark this page. Riders often come back to it a few weeks
                  in.
                </p>
              </div>
              <ShareButton
                slug={submission.slug}
                profileLabel={profileLabel}
              />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
