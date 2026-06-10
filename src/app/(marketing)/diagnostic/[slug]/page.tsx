import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Footer, Header, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { maskEmail } from "@/lib/admin/events-store";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { CLOSE_TO_BREAKTHROUGH, labelFor } from "@/lib/diagnostic/profiles";
import { getProductRecommendation } from "@/lib/diagnostic/product-routing";
import { ProductRecommendation } from "@/components/features/diagnostic/ProductRecommendation";
import { ResultsAnalytics } from "@/components/features/diagnostic/ResultsAnalytics";
import { ShareButton } from "@/components/features/diagnostic/ShareButton";
import { DownloadPdfButton } from "@/components/features/diagnostic/DownloadPdfButton";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";
import { ReadingProgress } from "@/components/features/diagnostic/ReadingProgress";
import { StickyCta } from "@/components/features/diagnostic/StickyCta";
import { SuccessBanner } from "@/components/features/diagnostic/SuccessBanner";
import { AskRoadmanHandoff } from "@/components/features/diagnostic/AskRoadmanHandoff";
import type { Breakdown, Profile } from "@/lib/diagnostic/types";
import { getTestimonialsByName, type Testimonial } from "@/lib/testimonials";

/**
 * Per-profile testimonial picks. Two each — the first lines up tightly
 * with the diagnosis (e.g. Damien is the canonical "I plateaued, the
 * plan broke it" story; Mary K is the canonical cycling-specific S&C
 * story for the strength gap), the second adds a second proof angle.
 * Brian Morrissey is the recovery/volume story, so he proves the
 * under-recovered diagnosis — not the strength gap, where Vern Locke's
 * raw sprint-power jump speaks to the neuromuscular leak directly.
 * Close-to-breakthrough reuses the plateau set because that's the
 * closest emotional match.
 */
const TESTIMONIAL_NAMES_BY_PROFILE: Record<Profile, string[]> = {
  underRecovered: ["Damien Maloney", "Brian Morrissey"],
  polarisation: ["Damien Maloney", "Blair Corey"],
  strengthGap: ["Mary K", "Vern Locke"],
  fuelingDeficit: ["Chris O'Connor", "Gregory Gross"],
};
const CLOSE_TO_BREAKTHROUGH_TESTIMONIAL_NAMES = [
  "Rob Capps",
  "Damien Maloney",
];

/**
 * One honest, season-aware nudge above the final CTA. The page is
 * force-dynamic, so `new Date()` on the server is correct per request
 * and there's no hydration concern — this subtree never renders on the
 * client. Deliberately no fake scarcity (no "X spots left", no
 * countdowns): this audience has been burned and reads hype instantly.
 * The only deadline is the calendar, and the calendar is real.
 * Northern-hemisphere framing — the audience skews IE/UK/EU/US masters.
 */
function seasonUrgencyLine(now: Date): string {
  const m = now.getMonth(); // 0 = Jan
  if (m >= 2 && m <= 4) {
    return "It’s spring. The season’s already rolling for the riders you’ll be on the road with this year — and every week you stay at this number is a week of it you don’t get back.";
  }
  if (m >= 5 && m <= 7) {
    return "It’s mid-season. You can’t fake the form in August that you don’t build now. The plateau won’t break on its own — it breaks the week you change something.";
  }
  if (m >= 8 && m <= 9) {
    return "The season’s winding down — which makes right now the window to fix the base for next year, while everyone else waits until March to start.";
  }
  return "It’s the off-season — where next year is actually won. What you build now is the form you line up with in spring. Wait, and you start the year already behind.";
}

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
  if (!submission) return { title: "Your diagnosis" };

  const label = labelFor(
    submission.primaryProfile,
    submission.closeToBreakthrough
  );

  return {
    title: `Your diagnosis: ${label}`,
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

  // Segment the rider toward the product their result actually calls for:
  // the Method (self-serve system), Not Done Yet (ongoing coaching), or
  // the Inner Circle (premium 1:1). Routing is driven by the scored
  // profiles, co-limiters, the severe-multi-system flag and retake history.
  const recommendation = getProductRecommendation(submission);
  const product = recommendation.product;

  const testimonialNames = isCloseToBreakthrough
    ? CLOSE_TO_BREAKTHROUGH_TESTIMONIAL_NAMES
    : TESTIMONIAL_NAMES_BY_PROFILE[submission.primaryProfile];
  const profileTestimonials: Testimonial[] =
    getTestimonialsByName(testimonialNames);

  const seasonLine = seasonUrgencyLine(new Date());

  return (
    <>
      <ReadingProgress />
      <StickyCta
        href={product.href}
        label={product.ctaLabel}
        ctaTag={`${product.ctaTag}-sticky`}
      />
      {/* SuccessBanner is gated by ?fresh=1 so it only shows on the
          post-submit redirect; Suspense is required because it reads
          useSearchParams. */}
      <Suspense fallback={null}>
        <SuccessBanner emailHint={maskEmail(submission.email)} />
      </Suspense>
      {/* Fires fbq Lead event — PageView is handled globally by
          ConsentAwarePixel in root layout. This is the diagnostic
          funnel's primary conversion signal. */}
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
                  have you self-diagnose off a sales page. The Inner Circle
                  below is built for exactly this — it starts with a
                  conversation.
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
                  href={product.href}
                  data-cta={`${product.ctaTag}-mid-content`}
                  data-product={product.path}
                  {...(product.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="shrink-0 font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-5 py-2 rounded-md transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  {product.ctaLabel.toUpperCase()}
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

        {/* ── Profile-matched proof ──────────────────── */}
        {/* Two testimonials whose story lines up with this diagnosis —
            e.g. Damien for plateau, Chris for fuelling. Sits between
            the diagnosis copy and the NDY pitch so the rider sees
            "someone like me did this" before they see the price. */}
        {profileTestimonials.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  RIDERS WHO WERE HERE
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-8">
                  THEY HAD THE SAME DIAGNOSIS
                </h2>
              </ScrollReveal>
              <div className="grid gap-4 md:grid-cols-2">
                {profileTestimonials.map((t, i) => (
                  <ScrollReveal
                    key={t.name}
                    direction="up"
                    delay={i * 0.1}
                  >
                    <figure className="h-full rounded-xl border border-white/10 bg-background-elevated p-6 flex flex-col gap-4">
                      {t.stat && (
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-coral text-3xl tracking-wide">
                            {t.stat}
                          </span>
                          {t.statLabel && (
                            <span className="text-foreground-muted text-xs uppercase tracking-widest">
                              {t.statLabel}
                            </span>
                          )}
                        </div>
                      )}
                      <blockquote className="text-off-white/90 leading-relaxed">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-auto pt-2 border-t border-white/5">
                        <p className="font-heading text-off-white text-sm tracking-wide">
                          {t.name.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs mt-1">
                          {t.detail}
                        </p>
                      </figcaption>
                    </figure>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* ── Segmented product recommendation ───────── */}
        {/* The hard offer — the one product this rider's result funnels
            toward (Method / Not Done Yet / Inner Circle), with a callout
            personalised to their diagnosis, the price, what's included,
            one proof line and a single CTA. */}
        <ProductRecommendation
          rec={recommendation}
          profile={submission.primaryProfile}
        />

        {/* ── CTA + secondary ────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center space-y-6">
            <h2 className="font-heading text-off-white text-2xl md:text-3xl">
              YOUR NEXT MOVE
            </h2>
            <p className="text-off-white/90 leading-relaxed max-w-xl mx-auto">
              {product.finalNudge}
            </p>
            {/* Honest, season-aware nudge — no fake scarcity, no
                countdowns. The calendar is the only real deadline this
                audience trusts. */}
            <div className="mx-auto max-w-xl rounded-lg border border-coral/25 bg-coral/5 px-5 py-4">
              <p className="text-off-white/90 text-sm md:text-[15px] leading-relaxed">
                {seasonLine}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {product.external ? (
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta={`${product.ctaTag}-primary`}
                  data-product={product.path}
                  data-profile={submission.primaryProfile}
                  className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-8 py-4 rounded-md transition-colors cursor-pointer text-lg"
                >
                  {product.ctaLabel.toUpperCase()}
                </a>
              ) : (
                <Link
                  href={product.href}
                  data-cta={`${product.ctaTag}-primary`}
                  data-product={product.path}
                  data-profile={submission.primaryProfile}
                  className="font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-8 py-4 rounded-md transition-colors cursor-pointer text-lg"
                >
                  {product.ctaLabel.toUpperCase()}
                </Link>
              )}
            </div>
            {/* Risk reversal at the decision point — product-appropriate,
                restating only claims already made for this offer. */}
            <p className="text-foreground-subtle text-xs md:text-sm">
              {product.riskReversal}
            </p>
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
              <div className="flex flex-wrap items-center gap-3">
                <DownloadPdfButton
                  slug={submission.slug}
                  profile={submission.primaryProfile}
                />
                <ShareButton
                  slug={submission.slug}
                  profileLabel={profileLabel}
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
